"use client";

import {
  type ChangeEvent,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/template/checkbox";
import type { SerializedOutreachPageRecord } from "@/lib/outreach";
import { toOutreachSlug } from "@/lib/outreach/slug";
import { cn } from "@/lib/utils";

import { deleteOutreachPageAction, importOutreachEntriesAction } from "../outreach/actions";

interface OutreachManagerProps {
  locale: string;
  initialPages: SerializedOutreachPageRecord[];
}

interface PreviewRow {
  name: string;
  text: string;
  slug: string;
  templateId: number;
  campaign: string;
  sub: string;
}

type ParseErrorCode =
  | "empty"
  | "missingColumns"
  | "missingValues"
  | "invalidSlug"
  | "invalidTemplate"
  | "invalidCampaign"
  | "invalidSub";

interface ParseError {
  row: number;
  code: ParseErrorCode;
}

type UploadStatus =
  | { state: "idle" }
  | { state: "success"; created: number; updated: number }
  | { state: "error"; message: string }
  | { state: "validation"; message: string };

type TableStatus =
  | { state: "idle" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

type SortField = "createdAt" | "lastVisitedAt" | "visitCount";

type VisitFilter = "any" | "visited" | "notVisited";

type BookedFilter = "any" | "yes" | "no";

interface FilterState {
  sortField: SortField;
  sortDirection: "asc" | "desc";
  visitStatus: VisitFilter;
  booked: BookedFilter;
  templates: number[];
  campaigns: string[];
  subFirst: string[];
  subSecond: string[];
  subNumbers: string[];
  exactDate: string;
}

const TEXT_HEADER_CANDIDATES = ["text to display", "text", "copy", "message"];
const TEMPLATE_HEADER_CANDIDATES = ["template", "template id", "variant"];
const CAMPAIGN_HEADER_CANDIDATES = ["campaign"];
const SUB_HEADER_CANDIDATES = ["sub"];
const CAMPAIGN_PATTERN = /^[A-Z]{3}$/;
const SUB_PATTERN = /^[A-Z]{2}[0-9]$/;
const DEFAULT_FILTERS: FilterState = {
  sortField: "createdAt",
  sortDirection: "desc",
  visitStatus: "any",
  booked: "any",
  templates: [],
  campaigns: [],
  subFirst: [],
  subSecond: [],
  subNumbers: [],
  exactDate: "",
};

const FILTER_ACTION_BUTTON_CLASSES =
  "h-8 rounded-lg border border-white/20 bg-white/5 px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70 transition hover:border-white/35 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40";

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
    return { rows: [], errors: [{ row: 0, code: "empty" }] };
  }

  const header = filtered[0].map((cell) => cell.trim().toLowerCase());
  const nameIndex = header.findIndex((cell) => cell === "name");
  const textIndex = header.findIndex((cell) => TEXT_HEADER_CANDIDATES.includes(cell));
  const templateIndex = header.findIndex((cell) => TEMPLATE_HEADER_CANDIDATES.includes(cell));
  const campaignIndex = header.findIndex((cell) => CAMPAIGN_HEADER_CANDIDATES.includes(cell));
  const subIndex = header.findIndex((cell) => SUB_HEADER_CANDIDATES.includes(cell));

  if (nameIndex === -1 || textIndex === -1 || templateIndex === -1 || campaignIndex === -1 || subIndex === -1) {
    return { rows: [], errors: [{ row: 0, code: "missingColumns" }] };
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
      errors.push({ row: i + 1, code: "missingValues" });
      continue;
    }

    const slug = toOutreachSlug(name);

    if (!slug) {
      errors.push({ row: i + 1, code: "invalidSlug" });
      continue;
    }

    const templateCell = (raw[templateIndex] ?? "").trim();
    const templateId = Number.parseInt(templateCell, 10);

    if (!Number.isFinite(templateId) || templateId < 1) {
      errors.push({ row: i + 1, code: "invalidTemplate" });
      continue;
    }

    const campaignCell = (raw[campaignIndex] ?? "").trim().toUpperCase();

    if (!CAMPAIGN_PATTERN.test(campaignCell)) {
      errors.push({ row: i + 1, code: "invalidCampaign" });
      continue;
    }

    const subCell = (raw[subIndex] ?? "").trim().toUpperCase();

    if (!SUB_PATTERN.test(subCell)) {
      errors.push({ row: i + 1, code: "invalidSub" });
      continue;
    }

    previewRows.push({ name, text, slug, templateId, campaign: campaignCell, sub: subCell });
  }

  return { rows: previewRows, errors };
}

function formatDate(
  locale: string,
  value: string | null,
  options?: Intl.DateTimeFormatOptions,
) {
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

function getSortValue(
  page: SerializedOutreachPageRecord,
  field: SortField,
  direction: "asc" | "desc",
) {
  switch (field) {
    case "createdAt":
      return new Date(page.createdAt).getTime();
    case "lastVisitedAt":
      if (!page.lastVisitedAt) {
        return direction === "asc"
          ? Number.POSITIVE_INFINITY
          : Number.NEGATIVE_INFINITY;
      }
      return new Date(page.lastVisitedAt).getTime();
    case "visitCount":
      return page.visitCount;
    default:
      return 0;
  }
}

export function OutreachManager({ locale, initialPages }: OutreachManagerProps) {
  const t = useTranslations("DashboardOutreach");
  const [pages, setPages] = useState(initialPages);
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>({ state: "idle" });
  const [tableStatus, setTableStatus] = useState<TableStatus>({ state: "idle" });
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isImporting, startImportTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const metrics = useMemo(() => {
    const total = pages.length;
    const visited = pages.filter((page) => page.visitCount > 0).length;
    const untouched = total - visited;
    const booked = pages.filter((page) => page.bookedMeeting).length;

    return { total, visited, untouched, booked };
  }, [pages]);

  const templateOptions = useMemo(() => {
    const unique = new Set<number>();
    for (const page of pages) {
      unique.add(page.templateId);
    }
    return Array.from(unique).sort((a, b) => a - b);
  }, [pages]);

  const campaignOptions = useMemo(() => {
    const unique = new Set<string>();
    for (const page of pages) {
      unique.add(page.campaign.toUpperCase());
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [pages]);

  const subOptions = useMemo(() => {
    const first = new Set<string>();
    const second = new Set<string>();
    const numbers = new Set<string>();

    for (const page of pages) {
      const value = page.sub.toUpperCase();
      if (value.length >= 1) {
        first.add(value[0]);
      }
      if (value.length >= 2) {
        second.add(value[1]);
      }
      if (value.length >= 3) {
        numbers.add(value.slice(2));
      }
    }

    return {
      first: Array.from(first).sort((a, b) => a.localeCompare(b)),
      second: Array.from(second).sort((a, b) => a.localeCompare(b)),
      numbers: Array.from(numbers).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    };
  }, [pages]);

  const hasSubSegments =
    subOptions.first.length > 0 || subOptions.second.length > 0 || subOptions.numbers.length > 0;

  const templatePreviews = useMemo(
    () => [
      {
        id: 1,
        title: t("templates.items.1.title"),
        body: t("templates.items.1.body"),
        points: [
          t("templates.items.1.points.0"),
          t("templates.items.1.points.1"),
          t("templates.items.1.points.2"),
        ],
      },
    ],
    [t],
  );

  useEffect(() => {
    setFilters((prev) => {
      const nextTemplates = prev.templates.filter((id) => templateOptions.includes(id));
      const nextCampaigns = prev.campaigns.filter((code) => campaignOptions.includes(code));
      const nextSubFirst = prev.subFirst.filter((value) => subOptions.first.includes(value));
      const nextSubSecond = prev.subSecond.filter((value) => subOptions.second.includes(value));
      const nextSubNumbers = prev.subNumbers.filter((value) => subOptions.numbers.includes(value));

      if (
        nextTemplates.length === prev.templates.length &&
        nextCampaigns.length === prev.campaigns.length &&
        nextSubFirst.length === prev.subFirst.length &&
        nextSubSecond.length === prev.subSecond.length &&
        nextSubNumbers.length === prev.subNumbers.length
      ) {
        return prev;
      }

      return {
        ...prev,
        templates: nextTemplates,
        campaigns: nextCampaigns,
        subFirst: nextSubFirst,
        subSecond: nextSubSecond,
        subNumbers: nextSubNumbers,
      };
    });
  }, [templateOptions, campaignOptions, subOptions]);

  const filteredPages = useMemo(() => {
    const filtered = pages.filter((page) => {
      if (filters.visitStatus === "visited" && page.visitCount === 0) {
        return false;
      }

      if (filters.visitStatus === "notVisited" && page.visitCount > 0) {
        return false;
      }

      if (filters.booked === "yes" && !page.bookedMeeting) {
        return false;
      }

      if (filters.booked === "no" && page.bookedMeeting) {
        return false;
      }

      if (filters.templates.length > 0 && !filters.templates.includes(page.templateId)) {
        return false;
      }

      if (filters.campaigns.length > 0 && !filters.campaigns.includes(page.campaign.toUpperCase())) {
        return false;
      }

      const subValue = page.sub.toUpperCase();
      const subFirst = subValue[0] ?? "";
      const subSecond = subValue[1] ?? "";
      const subNumber = subValue.slice(2);

      if (filters.subFirst.length > 0 && !filters.subFirst.includes(subFirst)) {
        return false;
      }

      if (filters.subSecond.length > 0 && !filters.subSecond.includes(subSecond)) {
        return false;
      }

      if (filters.subNumbers.length > 0 && !filters.subNumbers.includes(subNumber)) {
        return false;
      }

      if (filters.exactDate) {
        const createdDate = new Date(page.createdAt).toISOString().slice(0, 10);
        if (createdDate !== filters.exactDate) {
          return false;
        }
      }

      return true;
    });

    const directionMultiplier = filters.sortDirection === "asc" ? 1 : -1;

    return filtered.sort((a, b) => {
      const valueA = getSortValue(a, filters.sortField, filters.sortDirection);
      const valueB = getSortValue(b, filters.sortField, filters.sortDirection);

      if (valueA === valueB) {
        return a.slug.localeCompare(b.slug);
      }

      return valueA > valueB ? directionMultiplier : -directionMultiplier;
    });
  }, [filters, pages]);

  const hasParseErrors = parseErrors.length > 0;
  const hasActiveFilters = useMemo(() => {
    return (
      filters.sortField !== DEFAULT_FILTERS.sortField ||
      filters.sortDirection !== DEFAULT_FILTERS.sortDirection ||
      filters.visitStatus !== DEFAULT_FILTERS.visitStatus ||
      filters.booked !== DEFAULT_FILTERS.booked ||
      filters.templates.length > 0 ||
      filters.campaigns.length > 0 ||
      filters.subFirst.length > 0 ||
      filters.subSecond.length > 0 ||
      filters.subNumbers.length > 0 ||
      filters.exactDate !== DEFAULT_FILTERS.exactDate
    );
  }, [filters]);

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

    startImportTransition(async () => {
      setStatus({ state: "idle" });
      setTableStatus({ state: "idle" });

      const payload = preview.map((row) => ({
        name: row.name,
        text: row.text,
        templateId: row.templateId,
        campaign: row.campaign,
        sub: row.sub,
      }));

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

  const handleDelete = (slug: string) => {
    setTableStatus({ state: "idle" });
    setDeletingSlug(slug);

    startDeleteTransition(async () => {
      const result = await deleteOutreachPageAction(locale, { slug });

      if (!result.success) {
        const message =
          result.error === "unauthorized"
            ? t("status.unauthorized")
            : result.error === "not_found"
            ? t("table.delete.notFound")
            : t("table.delete.error");
        setTableStatus({ state: "error", message });
        setDeletingSlug(null);
        return;
      }

      setPages(result.pages);
      setTableStatus({ state: "success", message: t("table.delete.success", { slug }) });
      setDeletingSlug(null);
    });
  };

  const toggleTemplateFilter = (templateId: number, checked: boolean) => {
    setFilters((prev) => {
      const templates = new Set(prev.templates);
      if (checked) {
        templates.add(templateId);
      } else {
        templates.delete(templateId);
      }
      return { ...prev, templates: Array.from(templates).sort((a, b) => a - b) };
    });
  };

  const selectAllTemplates = () => {
    setFilters((prev) => ({
      ...prev,
      templates: templateOptions.slice().sort((a, b) => a - b),
    }));
  };

  const clearTemplateFilters = () => {
    setFilters((prev) => ({
      ...prev,
      templates: [],
    }));
  };

  const toggleCampaignFilter = (campaign: string, checked: boolean) => {
    setFilters((prev) => {
      const campaigns = new Set(prev.campaigns);
      if (checked) {
        campaigns.add(campaign);
      } else {
        campaigns.delete(campaign);
      }
      return {
        ...prev,
        campaigns: Array.from(campaigns).sort((a, b) => a.localeCompare(b)),
      };
    });
  };

  const selectAllCampaigns = () => {
    setFilters((prev) => ({
      ...prev,
      campaigns: campaignOptions.slice().sort((a, b) => a.localeCompare(b)),
    }));
  };

  const clearCampaignFilters = () => {
    setFilters((prev) => ({
      ...prev,
      campaigns: [],
    }));
  };

  const toggleSubFirstFilter = (value: string, checked: boolean) => {
    setFilters((prev) => {
      const subFirst = new Set(prev.subFirst);
      if (checked) {
        subFirst.add(value);
      } else {
        subFirst.delete(value);
      }
      return {
        ...prev,
        subFirst: Array.from(subFirst).sort((a, b) => a.localeCompare(b)),
      };
    });
  };

  const selectAllSubFirst = () => {
    setFilters((prev) => ({
      ...prev,
      subFirst: subOptions.first.slice().sort((a, b) => a.localeCompare(b)),
    }));
  };

  const clearSubFirst = () => {
    setFilters((prev) => ({
      ...prev,
      subFirst: [],
    }));
  };

  const toggleSubSecondFilter = (value: string, checked: boolean) => {
    setFilters((prev) => {
      const subSecond = new Set(prev.subSecond);
      if (checked) {
        subSecond.add(value);
      } else {
        subSecond.delete(value);
      }
      return {
        ...prev,
        subSecond: Array.from(subSecond).sort((a, b) => a.localeCompare(b)),
      };
    });
  };

  const selectAllSubSecond = () => {
    setFilters((prev) => ({
      ...prev,
      subSecond: subOptions.second.slice().sort((a, b) => a.localeCompare(b)),
    }));
  };

  const clearSubSecond = () => {
    setFilters((prev) => ({
      ...prev,
      subSecond: [],
    }));
  };

  const toggleSubNumberFilter = (value: string, checked: boolean) => {
    setFilters((prev) => {
      const subNumbers = new Set(prev.subNumbers);
      if (checked) {
        subNumbers.add(value);
      } else {
        subNumbers.delete(value);
      }
      return {
        ...prev,
        subNumbers: Array.from(subNumbers).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      };
    });
  };

  const selectAllSubNumbers = () => {
    setFilters((prev) => ({
      ...prev,
      subNumbers: subOptions.numbers
        .slice()
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    }));
  };

  const clearSubNumbers = () => {
    setFilters((prev) => ({
      ...prev,
      subNumbers: [],
    }));
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        <Card className="border-white/10 bg-white/[0.03] text-white">
          <CardHeader className="space-y-1 pb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
              {t("metrics.booked.label")}
            </p>
            <CardTitle className="text-2xl font-semibold">{metrics.booked}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-white/60">
            {t("metrics.booked.caption", { count: metrics.booked })}
          </CardContent>
        </Card>
      </section>

      <Card className="border-white/10 bg-white/[0.03] text-white">
        <CardHeader className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              {t("templates.eyebrow")}
            </p>
            <CardTitle className="text-2xl font-semibold">{t("templates.title")}</CardTitle>
            <p className="text-sm text-white/60">{t("templates.description")}</p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {templatePreviews.map((template) => (
            <div
              key={template.id}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/15 via-transparent to-fuchsia-500/20" />
              <div className="relative space-y-3">
                <Badge
                  className="w-fit border-white/20 bg-white/10 text-[11px] uppercase tracking-[0.3em] text-white/70"
                  variant="outline"
                >
                  {t("templates.badge", { id: template.id })}
                </Badge>
                <h3 className="text-xl font-semibold text-white">{template.title}</h3>
                <p className="text-sm text-white/70">{template.body}</p>
                <ul className="space-y-2 text-sm text-white/65">
                  {template.points.map((point, index) => (
                    <li key={`${template.id}-point-${index}`} className="flex items-start gap-2">
                      <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

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
                disabled={isImporting}
                onClick={handlePush}
              >
                {isImporting
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
                    {t(`upload.errors.${error.code}` as const, { row: error.row })}
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
                      {t("upload.previewColumns.template")}
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-white/60">
                      {t("upload.previewColumns.campaign")}
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-white/60">
                      {t("upload.previewColumns.sub")}
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
                      <TableCell className="align-top text-xs text-white/60">
                        {t("upload.previewColumns.templateLabel", { id: row.templateId })}
                      </TableCell>
                      <TableCell className="align-top text-xs text-white/60">{row.campaign}</TableCell>
                      <TableCell className="align-top text-xs text-white/60">{row.sub}</TableCell>
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
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                {t("filters.sortBy")}
              </Label>
              <Select
                value={filters.sortField}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, sortField: value as SortField }))
                }
              >
                <SelectTrigger className="h-11 rounded-xl border-white/20 bg-black/30 text-sm text-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900 text-white">
                  <SelectItem value="createdAt">{t("filters.sortOptions.createdAt")}</SelectItem>
                  <SelectItem value="lastVisitedAt">{t("filters.sortOptions.lastVisitedAt")}</SelectItem>
                  <SelectItem value="visitCount">{t("filters.sortOptions.visitCount")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                {t("filters.sortOrder")}
              </Label>
              <Select
                value={filters.sortDirection}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, sortDirection: value as "asc" | "desc" }))
                }
              >
                <SelectTrigger className="h-11 rounded-xl border-white/20 bg-black/30 text-sm text-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900 text-white">
                  <SelectItem value="desc">{t("filters.order.desc")}</SelectItem>
                  <SelectItem value="asc">{t("filters.order.asc")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                {t("filters.visitStatus")}
              </Label>
              <Select
                value={filters.visitStatus}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, visitStatus: value as VisitFilter }))
                }
              >
                <SelectTrigger className="h-11 rounded-xl border-white/20 bg-black/30 text-sm text-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900 text-white">
                  <SelectItem value="any">{t("filters.visitOptions.any")}</SelectItem>
                  <SelectItem value="visited">{t("filters.visitOptions.visited")}</SelectItem>
                  <SelectItem value="notVisited">{t("filters.visitOptions.notVisited")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                {t("filters.booked")}
              </Label>
              <Select
                value={filters.booked}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, booked: value as BookedFilter }))
                }
              >
                <SelectTrigger className="h-11 rounded-xl border-white/20 bg-black/30 text-sm text-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-900 text-white">
                  <SelectItem value="any">{t("filters.bookedOptions.any")}</SelectItem>
                  <SelectItem value="yes">{t("filters.bookedOptions.yes")}</SelectItem>
                  <SelectItem value="no">{t("filters.bookedOptions.no")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                {t("filters.addedOn")}
              </Label>
              <Input
                className="h-11 rounded-xl border-white/20 bg-black/30 text-sm text-white/80"
                type="date"
                value={filters.exactDate}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, exactDate: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                  {t("filters.templates")}
                </Label>
                {templateOptions.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <Button
                      className={FILTER_ACTION_BUTTON_CLASSES}
                      disabled={filters.templates.length === templateOptions.length}
                      onClick={selectAllTemplates}
                      variant="ghost"
                    >
                      {t("filters.actions.selectAll")}
                    </Button>
                    <Button
                      className={FILTER_ACTION_BUTTON_CLASSES}
                      disabled={filters.templates.length === 0}
                      onClick={clearTemplateFilters}
                      variant="ghost"
                    >
                      {t("filters.actions.clear")}
                    </Button>
                  </div>
                ) : null}
              </div>
              {templateOptions.length === 0 ? (
                <p className="text-xs text-white/50">{t("filters.templatesEmpty")}</p>
              ) : (
                <ScrollArea className="max-h-40 rounded-xl border border-white/10 bg-black/30">
                  <div className="flex flex-wrap gap-2 p-3">
                    {templateOptions.map((templateId) => {
                      const checked = filters.templates.includes(templateId);
                      const inputId = `template-filter-${templateId}`;
                      return (
                        <label
                          key={inputId}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                            checked
                              ? "border-sky-400/70 bg-sky-500/20 text-white"
                              : "border-white/15 bg-white/5 text-white/70 hover:border-white/30",
                          )}
                          htmlFor={inputId}
                        >
                          <Checkbox
                            id={inputId}
                            checked={checked}
                            className="h-3.5 w-3.5 border-white/30"
                            onCheckedChange={(value) =>
                              toggleTemplateFilter(templateId, value === true)
                            }
                          />
                          <span>{t("filters.templateLabel", { id: templateId })}</span>
                        </label>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                  {t("filters.campaigns")}
                </Label>
                {campaignOptions.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <Button
                      className={FILTER_ACTION_BUTTON_CLASSES}
                      disabled={filters.campaigns.length === campaignOptions.length}
                      onClick={selectAllCampaigns}
                      variant="ghost"
                    >
                      {t("filters.actions.selectAll")}
                    </Button>
                    <Button
                      className={FILTER_ACTION_BUTTON_CLASSES}
                      disabled={filters.campaigns.length === 0}
                      onClick={clearCampaignFilters}
                      variant="ghost"
                    >
                      {t("filters.actions.clear")}
                    </Button>
                  </div>
                ) : null}
              </div>
              {campaignOptions.length === 0 ? (
                <p className="text-xs text-white/50">{t("filters.campaignsEmpty")}</p>
              ) : (
                <ScrollArea className="max-h-40 rounded-xl border border-white/10 bg-black/30">
                  <div className="flex flex-wrap gap-2 p-3">
                    {campaignOptions.map((campaign) => {
                      const checked = filters.campaigns.includes(campaign);
                      const inputId = `campaign-filter-${campaign}`;
                      return (
                        <label
                          key={inputId}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                            checked
                              ? "border-sky-400/70 bg-sky-500/20 text-white"
                              : "border-white/15 bg-white/5 text-white/70 hover:border-white/30",
                          )}
                          htmlFor={inputId}
                        >
                          <Checkbox
                            id={inputId}
                            checked={checked}
                            className="h-3.5 w-3.5 border-white/30"
                            onCheckedChange={(value) =>
                              toggleCampaignFilter(campaign, value === true)
                            }
                          />
                          <span>{campaign}</span>
                        </label>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                {t("filters.sub.label")}
              </Label>
              {hasSubSegments ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
                        {t("filters.sub.first")}
                      </p>
                      {subOptions.first.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <Button
                            className={FILTER_ACTION_BUTTON_CLASSES}
                            disabled={filters.subFirst.length === subOptions.first.length}
                            onClick={selectAllSubFirst}
                            variant="ghost"
                          >
                            {t("filters.actions.selectAll")}
                          </Button>
                          <Button
                            className={FILTER_ACTION_BUTTON_CLASSES}
                            disabled={filters.subFirst.length === 0}
                            onClick={clearSubFirst}
                            variant="ghost"
                          >
                            {t("filters.actions.clear")}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                    {subOptions.first.length > 0 ? (
                      <ScrollArea className="max-h-40 rounded-xl border border-white/10 bg-black/30">
                        <div className="flex flex-wrap gap-2 p-3">
                          {subOptions.first.map((value) => {
                            const checked = filters.subFirst.includes(value);
                            const inputId = `sub-first-${value}`;
                            return (
                              <label
                                key={inputId}
                                className={cn(
                                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                                  checked
                                    ? "border-sky-400/70 bg-sky-500/20 text-white"
                                    : "border-white/15 bg-white/5 text-white/70 hover:border-white/30",
                                )}
                                htmlFor={inputId}
                              >
                                <Checkbox
                                  id={inputId}
                                  checked={checked}
                                  className="h-3.5 w-3.5 border-white/30"
                                  onCheckedChange={(checked) =>
                                    toggleSubFirstFilter(value, checked === true)
                                  }
                                />
                                <span>{value}</span>
                              </label>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
                        {t("filters.sub.second")}
                      </p>
                      {subOptions.second.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <Button
                            className={FILTER_ACTION_BUTTON_CLASSES}
                            disabled={filters.subSecond.length === subOptions.second.length}
                            onClick={selectAllSubSecond}
                            variant="ghost"
                          >
                            {t("filters.actions.selectAll")}
                          </Button>
                          <Button
                            className={FILTER_ACTION_BUTTON_CLASSES}
                            disabled={filters.subSecond.length === 0}
                            onClick={clearSubSecond}
                            variant="ghost"
                          >
                            {t("filters.actions.clear")}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                    {subOptions.second.length > 0 ? (
                      <ScrollArea className="max-h-40 rounded-xl border border-white/10 bg-black/30">
                        <div className="flex flex-wrap gap-2 p-3">
                          {subOptions.second.map((value) => {
                            const checked = filters.subSecond.includes(value);
                            const inputId = `sub-second-${value}`;
                            return (
                              <label
                                key={inputId}
                                className={cn(
                                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                                  checked
                                    ? "border-sky-400/70 bg-sky-500/20 text-white"
                                    : "border-white/15 bg-white/5 text-white/70 hover:border-white/30",
                                )}
                                htmlFor={inputId}
                              >
                                <Checkbox
                                  id={inputId}
                                  checked={checked}
                                  className="h-3.5 w-3.5 border-white/30"
                                  onCheckedChange={(checked) =>
                                    toggleSubSecondFilter(value, checked === true)
                                  }
                                />
                                <span>{value}</span>
                              </label>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
                        {t("filters.sub.number")}
                      </p>
                      {subOptions.numbers.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <Button
                            className={FILTER_ACTION_BUTTON_CLASSES}
                            disabled={filters.subNumbers.length === subOptions.numbers.length}
                            onClick={selectAllSubNumbers}
                            variant="ghost"
                          >
                            {t("filters.actions.selectAll")}
                          </Button>
                          <Button
                            className={FILTER_ACTION_BUTTON_CLASSES}
                            disabled={filters.subNumbers.length === 0}
                            onClick={clearSubNumbers}
                            variant="ghost"
                          >
                            {t("filters.actions.clear")}
                          </Button>
                        </div>
                      ) : null}
                    </div>
                    {subOptions.numbers.length > 0 ? (
                      <ScrollArea className="max-h-40 rounded-xl border border-white/10 bg-black/30">
                        <div className="flex flex-wrap gap-2 p-3">
                          {subOptions.numbers.map((value) => {
                            const checked = filters.subNumbers.includes(value);
                            const inputId = `sub-number-${value}`;
                            return (
                              <label
                                key={inputId}
                                className={cn(
                                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                                  checked
                                    ? "border-sky-400/70 bg-sky-500/20 text-white"
                                    : "border-white/15 bg-white/5 text-white/70 hover:border-white/30",
                                )}
                                htmlFor={inputId}
                              >
                                <Checkbox
                                  id={inputId}
                                  checked={checked}
                                  className="h-3.5 w-3.5 border-white/30"
                                  onCheckedChange={(checked) =>
                                    toggleSubNumberFilter(value, checked === true)
                                  }
                                />
                                <span>{value}</span>
                              </label>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/50">{t("filters.sub.empty")}</p>
              )}
            </div>
          </div>
          {hasActiveFilters ? (
            <Button
              className="w-full sm:w-auto"
              onClick={clearFilters}
              variant="ghost"
            >
              {t("filters.clear")}
            </Button>
          ) : null}

          {tableStatus.state !== "idle" ? (
            <div
              className={cn(
                "rounded-xl border p-4 text-sm",
                tableStatus.state === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                  : "border-red-500/30 bg-red-500/10 text-red-100",
              )}
            >
              {tableStatus.message}
            </div>
          ) : null}

          {pages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-black/30 p-8 text-center text-sm text-white/50">
              {t("table.empty")}
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-black/30 p-8 text-center text-sm text-white/50">
              {t("table.noMatches")}
            </div>
          ) : (
            <ScrollArea className="max-h-[540px] rounded-xl border border-white/10">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/10">
                    <TableHead className="w-[160px] text-xs uppercase tracking-wide text-white/60">
                      {t("table.columns.company")}
                    </TableHead>
                    <TableHead className="w-[200px] text-xs uppercase tracking-wide text-white/60">
                      {t("table.columns.link")}
                    </TableHead>
                    <TableHead className="w-[120px] text-xs uppercase tracking-wide text-white/60">
                      {t("table.columns.template")}
                    </TableHead>
                    <TableHead className="w-[120px] text-xs uppercase tracking-wide text-white/60">
                      {t("table.columns.campaign")}
                    </TableHead>
                    <TableHead className="w-[120px] text-xs uppercase tracking-wide text-white/60">
                      {t("table.columns.sub")}
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-white/60">
                      {t("table.columns.text")}
                    </TableHead>
                    <TableHead className="w-[140px] text-xs uppercase tracking-wide text-white/60">
                      {t("table.columns.visits")}
                    </TableHead>
                    <TableHead className="w-[160px] text-xs uppercase tracking-wide text-white/60">
                      {t("table.columns.added")}
                    </TableHead>
                    <TableHead className="w-[160px] text-xs uppercase tracking-wide text-white/60">
                      {t("table.columns.booked")}
                    </TableHead>
                    <TableHead className="w-[160px] text-xs uppercase tracking-wide text-white/60">
                      {t("table.columns.updated")}
                    </TableHead>
                    <TableHead className="w-[120px] text-xs uppercase tracking-wide text-white/60">
                      {t("table.columns.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.map((page) => {
                    const lastVisitedLabel = formatDate(locale, page.lastVisitedAt, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });
                    const createdLabel = formatDate(locale, page.createdAt, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });
                    const updatedLabel = formatDate(locale, page.updatedAt, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });
                    const bookedLabel = formatDate(locale, page.bookedMeetingAt, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });

                    const isDeletingRow = isDeleting && deletingSlug === page.slug;

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
                              /outreach/{page.slug}
                            </code>
                            <Link
                              className="text-xs font-medium text-white/70 hover:text-white"
                              href={`/outreach/${page.slug}`}
                              target="_blank"
                            >
                              {t("table.openLink")}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell className="align-top text-xs text-white/60">
                          {t("filters.templateLabel", { id: page.templateId })}
                        </TableCell>
                        <TableCell className="align-top text-xs text-white/60">{page.campaign}</TableCell>
                        <TableCell className="align-top text-xs text-white/60">{page.sub}</TableCell>
                        <TableCell className="align-top text-sm text-white/70 whitespace-pre-line">
                          {truncate(page.displayText, 220)}
                        </TableCell>
                        <TableCell className="align-top text-xs text-white/60">
                          <div className="space-y-1">
                            <p className="font-semibold text-white">{page.visitCount}</p>
                            <p className="text-[11px] text-white/40">
                              {lastVisitedLabel ?? t("table.status.notVisited")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="align-top text-xs text-white/60">
                          {createdLabel ?? "—"}
                        </TableCell>
                        <TableCell className="align-top text-xs text-white/60">
                          <div className="space-y-1">
                            <Badge
                              className={cn(
                                "w-fit",
                                page.bookedMeeting
                                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
                                  : "border-white/20 bg-white/5 text-white/70",
                              )}
                              variant="outline"
                            >
                              {page.bookedMeeting
                                ? t("table.bookedStatus.yes")
                                : t("table.bookedStatus.no")}
                            </Badge>
                            <p className="text-[11px] text-white/40">
                              {bookedLabel ?? ""}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="align-top text-xs text-white/60">
                          {updatedLabel ?? "—"}
                        </TableCell>
                        <TableCell className="align-top text-xs text-white/60">
                          <Button
                            className="text-xs"
                            disabled={isDeletingRow}
                            onClick={() => handleDelete(page.slug)}
                            size="sm"
                            variant="ghost"
                          >
                            {isDeletingRow
                              ? t("table.delete.pending")
                              : t("table.delete.label")}
                          </Button>
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
