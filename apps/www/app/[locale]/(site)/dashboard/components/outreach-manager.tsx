"use client";

import { type ChangeEvent, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SerializedOutreachPageRecord } from "@/lib/outreach";
import { toOutreachSlug } from "@/lib/outreach/slug";
import { cn } from "@/lib/utils";

import { importOutreachEntriesAction } from "../outreach/actions";

interface OutreachManagerProps {
  locale: string;
  initialPages: SerializedOutreachPageRecord[];
}

interface PreviewRow {
  name: string;
  text: string;
  slug: string;
}

interface ParseError {
  row: number;
  message: string;
}

type UploadStatus =
  | { state: "idle" }
  | { state: "success"; created: number; updated: number }
  | { state: "error"; message: string }
  | { state: "validation"; message: string };

const TEXT_HEADER_CANDIDATES = ["text to display", "text", "copy", "message"];

function parseCsv(content: string): { rows: PreviewRow[]; errors: ParseError[] } {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];

    if (char === "\"") {
      if (inQuotes && content[i + 1] === "\"") {
        current += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && content[i + 1] === "\n") {
        i += 1;
      }
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  const filtered = rows.filter((cells) => cells.some((cell) => cell.trim().length > 0));

  if (filtered.length === 0) {
    return { rows: [], errors: [{ row: 0, message: "empty" }] };
  }

  const header = filtered[0].map((cell) => cell.trim().toLowerCase());
  const nameIndex = header.findIndex((cell) => cell === "name");
  const textIndex = header.findIndex((cell) => TEXT_HEADER_CANDIDATES.includes(cell));

  if (nameIndex === -1 || textIndex === -1) {
    return { rows: [], errors: [{ row: 0, message: "missingColumns" }] };
  }

  const previewRows: PreviewRow[] = [];
  const errors: ParseError[] = [];

  for (let i = 1; i < filtered.length; i += 1) {
    const raw = filtered[i];
    const name = (raw[nameIndex] ?? "").trim();
    const text = (raw[textIndex] ?? "").trim();

    if (!name && !text) {
      continue;
    }

    if (!name || !text) {
      errors.push({ row: i + 1, message: "missingValues" });
      continue;
    }

    const slug = toOutreachSlug(name);

    if (!slug) {
      errors.push({ row: i + 1, message: "invalidSlug" });
      continue;
    }

    previewRows.push({ name, text, slug });
  }

  return { rows: previewRows, errors };
}

function formatDate(locale: string, value: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) {
    return null;
  }

  try {
    const formatter = new Intl.DateTimeFormat(locale, options);
    return formatter.format(new Date(value));
  } catch (error) {
    return new Date(value).toISOString();
  }
}

function truncate(value: string, max = 120) {
  if (value.length <= max) {
    return value;
  }

  return `${value.slice(0, max - 1)}…`;
}

export function OutreachManager({ locale, initialPages }: OutreachManagerProps) {
  const t = useTranslations("DashboardOutreach");
  const [pages, setPages] = useState(initialPages);
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>({ state: "idle" });
  const [isPending, startTransition] = useTransition();

  const metrics = useMemo(() => {
    const total = pages.length;
    const visited = pages.filter((page) => page.visitCount > 0).length;
    const untouched = total - visited;

    return { total, visited, untouched };
  }, [pages]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setPreview(null);
      setParseErrors([]);
      setFileName(null);
      setStatus({ state: "idle" });
      return;
    }

    const text = await file.text();
    const result = parseCsv(text);

    if (result.errors.length > 0) {
      setStatus({ state: "validation", message: t("upload.validation") });
    } else {
      setStatus({ state: "idle" });
    }

    setPreview(result.rows.length > 0 ? result.rows : null);
    setParseErrors(result.errors);
    setFileName(file.name);
    event.target.value = "";
  };

  const handlePush = () => {
    if (!preview || preview.length === 0) {
      setStatus({ state: "validation", message: t("upload.validation") });
      return;
    }

    startTransition(async () => {
      setStatus({ state: "idle" });

      const payload = preview.map((row) => ({ name: row.name, text: row.text }));

      const result = await importOutreachEntriesAction(locale, payload);

      if (!result.success) {
        if (result.error === "validation") {
          setStatus({ state: "validation", message: t("status.validation") });
        } else if (result.error === "unauthorized") {
          setStatus({ state: "error", message: t("status.unauthorized") });
        } else {
          setStatus({ state: "error", message: t("status.error") });
        }
        return;
      }

      setPages(result.pages);
      setPreview(null);
      setParseErrors([]);
      setFileName(null);
      setStatus({ state: "success", created: result.created, updated: result.updated });
    });
  };

  const hasParseErrors = parseErrors.length > 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="border-white/10 bg-white/[0.03] text-white">
          <CardHeader className="space-y-1 pb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
              {t("metrics.total.label")}
            </p>
            <CardTitle className="text-2xl font-semibold">{metrics.total}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-white/60">
            {t("metrics.total.caption", { count: metrics.total })}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.03] text-white">
          <CardHeader className="space-y-1 pb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
              {t("metrics.visited.label")}
            </p>
            <CardTitle className="text-2xl font-semibold">{metrics.visited}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-white/60">
            {t("metrics.visited.caption", { count: metrics.visited })}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.03] text-white">
          <CardHeader className="space-y-1 pb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
              {t("metrics.untouched.label")}
            </p>
            <CardTitle className="text-2xl font-semibold">{metrics.untouched}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-white/60">
            {t("metrics.untouched.caption", { count: metrics.untouched })}
          </CardContent>
        </Card>
      </section>

      <Card className="border-white/10 bg-white/[0.04] text-white">
        <CardHeader className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              {t("upload.eyebrow")}
            </p>
            <CardTitle className="text-2xl font-semibold">{t("upload.title")}</CardTitle>
            <p className="text-sm text-white/60">{t("upload.description")}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="group relative inline-flex h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-white/20 bg-black/20 px-4 text-sm text-white/70 transition hover:border-white/40 hover:bg-black/30 sm:w-auto">
              <div className="flex flex-col">
                <span className="font-medium">{t("upload.cta")}</span>
                <span className="text-xs text-white/40">
                  {fileName ? t("upload.fileSelected", { name: fileName }) : t("upload.noFile")}
                </span>
              </div>
              <Input
                accept=".csv,text/csv"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                onChange={handleFileChange}
                type="file"
              />
            </label>
            {preview ? (
              <Button
                className="w-full sm:w-auto"
                disabled={isPending}
                onClick={handlePush}
              >
                {isPending
                  ? t("upload.pushing")
                  : t("upload.push", { count: preview.length })}
              </Button>
            ) : null}
          </div>
          {hasParseErrors ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              <p className="font-medium">{t("upload.errors.title", { count: parseErrors.length })}</p>
              <ul className="mt-2 space-y-1">
                {parseErrors.map((error, index) => (
                  <li key={`${error.row}-${index}`} className="text-xs">
                    {t(`upload.errors.${error.message}`, { row: error.row })}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {status.state === "success" ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
              {t("status.success", { created: status.created, updated: status.updated })}
            </div>
          ) : null}
          {status.state === "error" || status.state === "validation" ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {status.message}
            </div>
          ) : null}
        </CardHeader>
        {preview ? (
          <CardContent>
            <div className="mb-3 text-sm text-white/50">
              {t("upload.previewLabel", { count: preview.length })}
            </div>
            <ScrollArea className="max-h-64 rounded-xl border border-white/10">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/10">
                    <TableHead className="text-xs uppercase tracking-wide text-white/60">
                      {t("upload.previewColumns.name")}
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-white/60">
                      {t("upload.previewColumns.slug")}
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-white/60">
                      {t("upload.previewColumns.text")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((row) => (
                    <TableRow key={`${row.slug}-${row.name}`} className="border-white/10">
                      <TableCell className="align-top text-sm font-medium text-white">{row.name}</TableCell>
                      <TableCell className="align-top text-xs text-white/60">{row.slug}</TableCell>
                      <TableCell className="align-top text-sm text-white/70 whitespace-pre-line">
                        {truncate(row.text, 200)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        ) : null}
      </Card>

      <Card className="border-white/10 bg-white/[0.02] text-white">
        <CardHeader className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
            {t("table.eyebrow")}
          </p>
          <CardTitle className="text-2xl font-semibold">{t("table.title")}</CardTitle>
          <p className="text-sm text-white/60">{t("table.description")}</p>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-black/30 p-8 text-center text-sm text-white/50">
              {t("table.empty")}
            </div>
          ) : (
            <ScrollArea className="max-h-[480px] rounded-xl border border-white/10">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/10">
                    <TableHead className="w-[160px] text-xs uppercase tracking-wide text-white/60">
                      {t("table.columns.company")}
                    </TableHead>
                    <TableHead className="w-[220px] text-xs uppercase tracking-wide text-white/60">
                      {t("table.columns.link")}
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-white/60">
                      {t("table.columns.text")}
                    </TableHead>
                    <TableHead className="w-[120px] text-xs uppercase tracking-wide text-white/60">
                      {t("table.columns.visits")}
                    </TableHead>
                    <TableHead className="w-[160px] text-xs uppercase tracking-wide text-white/60">
                      {t("table.columns.updated")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => {
                    const firstVisitLabel = formatDate(locale, page.firstVisitedAt, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });
                    const lastUpdatedLabel = formatDate(locale, page.updatedAt, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });

                    return (
                      <TableRow key={page.id} className="border-white/10">
                        <TableCell className="align-top text-sm font-medium text-white">
                          <div className="space-y-1">
                            <p>{page.displayName}</p>
                            <Badge
                              className={cn(
                                "w-fit",
                                page.visitCount > 0
                                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
                                  : "border-white/20 bg-white/5 text-white/70",
                              )}
                              variant="outline"
                            >
                              {page.visitCount > 0
                                ? t("table.status.visited", { count: page.visitCount })
                                : t("table.status.pending")}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="align-top text-xs text-white/60">
                          <div className="space-y-1">
                            <code className="block rounded bg-black/40 px-2 py-1 text-[11px] text-white/70">
                              /{locale}/outreach/{page.slug}
                            </code>
                            <Link
                              className="text-xs font-medium text-white/70 hover:text-white"
                              href={`/${locale}/outreach/${page.slug}`}
                              target="_blank"
                            >
                              {t("table.openLink")}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell className="align-top text-sm text-white/70 whitespace-pre-line">
                          {truncate(page.displayText, 220)}
                        </TableCell>
                        <TableCell className="align-top text-xs text-white/60">
                          <div className="space-y-1">
                            <p className="font-semibold text-white">{page.visitCount}</p>
                            <p className="text-[11px] text-white/40">
                              {firstVisitLabel ?? t("table.status.notVisited")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="align-top text-xs text-white/60">
                          {lastUpdatedLabel ?? "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
