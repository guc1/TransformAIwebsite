"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Mail, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert/alert";
import { cn } from "@/lib/utils";

import {
  ANALYTICS_REQUEST_TYPES,
  type AnalyticsRequestType,
} from "./request-types";
import {
  initialState,
  sendAnalyticsRequest,
} from "./server/send-request";

type AnalyticsRequestFormProps = {
  onDismiss?: () => void;
};

const fieldClassName =
  "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:border-white/40 transition disabled:cursor-not-allowed disabled:opacity-60";

export function AnalyticsRequestForm({ onDismiss }: AnalyticsRequestFormProps) {
  const t = useTranslations("Analytics.requestForm");
  const [state, formAction] = useFormState(sendAnalyticsRequest, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [requestType, setRequestType] = useState<AnalyticsRequestType>(
    ANALYTICS_REQUEST_TYPES[0].value,
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setRequestType(ANALYTICS_REQUEST_TYPES[0].value);
    }
  }, [state]);

  const requestTypeOptions = useMemo(
    () =>
      ANALYTICS_REQUEST_TYPES.map((option) => ({
        value: option.value,
        title: t(`requestType.options.${option.translationKey}.title`),
        description: t(
          `requestType.options.${option.translationKey}.description`,
        ),
      })),
    [t],
  );

  const fields: {
    name: "name" | "company" | "email";
    label: string;
    placeholder: string;
    type?: string;
    autoComplete?: string;
    required?: boolean;
  }[] = [
    {
      name: "name",
      label: t("fields.name.label"),
      placeholder: t("fields.name.placeholder"),
      autoComplete: "name",
      required: true,
    },
    {
      name: "company",
      label: t("fields.company.label"),
      placeholder: t("fields.company.placeholder"),
      autoComplete: "organization",
    },
    {
      name: "email",
      type: "email",
      label: t("fields.email.label"),
      placeholder: t("fields.email.placeholder"),
      autoComplete: "email",
    },
  ];

  return (
    <div className="relative isolate flex w-full max-w-[880px] flex-col overflow-hidden rounded-[32px] border border-white/12 bg-white/[0.04] p-5 shadow-[0_28px_120px_rgba(15,23,42,0.45)] sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.3),_rgba(59,130,246,0))] blur-3xl"
      />
      <form
        ref={formRef}
        action={formAction}
        className="relative z-10 grid gap-5 md:grid-cols-[1.05fr_minmax(0,1fr)] md:gap-6"
      >
        {state.status === "success" && state.message ? (
          <Alert variant="success" className="border-none md:col-span-2">
            <AlertDescription variant="success">
              <div>
                <p className="text-sm font-semibold text-white">
                  {t("feedback.successTitle")}
                </p>
                <p className="mt-1 text-sm text-white/70">{state.message}</p>
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        {state.status === "error" && state.message ? (
          <Alert variant="error" className="border-none md:col-span-2">
            <AlertDescription variant="error">
              <div>
                <p className="text-sm font-semibold text-white">
                  {t("feedback.errorTitle")}
                </p>
                <p className="mt-1 text-sm text-white/70">{state.message}</p>
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col gap-5 md:pr-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                {t("badge")}
              </span>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-white sm:text-3xl">
                  {t("title")}
                </h3>
                <p className="text-sm text-white/70 sm:text-base">
                  {t("subtitle")}
                </p>
              </div>
            </div>
            {onDismiss ? (
              <button
                type="button"
                onClick={onDismiss}
                className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 transition hover:border-white/30 hover:text-white"
                aria-label={t("dismiss")}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/[0.06] px-3.5 py-2.5 text-left shadow-[0_18px_80px_rgba(15,23,42,0.35)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
              <Mail className="h-5 w-5" aria-hidden />
            </span>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                {t("channel.label")}
              </p>
              <p className="text-sm text-white/80">
                {t("channel.caption", { email: "info@transformai.nl" })}
              </p>
            </div>
          </div>
          <RequestTypeSelector
            label={t("requestType.label")}
            helperText={t("requestType.helper")}
            options={requestTypeOptions}
            selected={requestType}
            onSelect={setRequestType}
            error={state.fieldErrors?.requestType}
          />
        </div>

        <div className="space-y-4 md:pl-3">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(({ name, label, placeholder, type = "text", autoComplete, required }) => (
              <div key={name} className="space-y-2">
                <label
                  className="text-xs font-medium uppercase tracking-[0.2em] text-white/60"
                  htmlFor={name}
                >
                  {label}
                  {required ? <span className="ml-1 text-white/40">*</span> : null}
                </label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  autoComplete={autoComplete}
                  placeholder={placeholder}
                  className={cn(
                    fieldClassName,
                    state.fieldErrors?.[name] && "border-rose-400/70 text-white",
                  )}
                  aria-invalid={state.fieldErrors?.[name] ? "true" : undefined}
                  aria-describedby={state.fieldErrors?.[name] ? `${name}-error` : undefined}
                  required={required}
                />
                {state.fieldErrors?.[name] ? (
                  <p id={`${name}-error`} className="text-xs font-medium text-rose-300">
                    {state.fieldErrors[name]}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label
              className="text-xs font-medium uppercase tracking-[0.2em] text-white/60"
              htmlFor="description"
            >
              {t("fields.description.label")}
              <span className="ml-1 text-white/40">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              placeholder={t("fields.description.placeholder")}
              rows={5}
              className={cn(
                fieldClassName,
                "min-h-[140px] resize-y",
                state.fieldErrors?.description && "border-rose-400/70 text-white",
              )}
              aria-invalid={state.fieldErrors?.description ? "true" : undefined}
              aria-describedby={state.fieldErrors?.description ? "description-error" : undefined}
              required
            />
            {state.fieldErrors?.description ? (
              <p id="description-error" className="text-xs font-medium text-rose-300">
                {state.fieldErrors.description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <SubmitButton
              label={t("submit.label")}
              pendingLabel={t("submit.pending")}
            />
            <p className="text-xs leading-5 text-white/40 sm:text-right">
              {t("footnote", { email: "info@transformai.nl" })}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

type RequestTypeOption = {
  value: AnalyticsRequestType;
  title: string;
  description: string;
};

type RequestTypeSelectorProps = {
  label: string;
  helperText?: string;
  options: RequestTypeOption[];
  selected: AnalyticsRequestType;
  onSelect: (value: AnalyticsRequestType) => void;
  error?: string;
};

function RequestTypeSelector({
  label,
  helperText,
  options,
  selected,
  onSelect,
  error,
}: RequestTypeSelectorProps) {
  const { pending } = useFormStatus();

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <span className="text-sm font-medium tracking-wide text-white/90">
          {label}
        </span>
        {helperText ? (
          <span className="text-xs text-white/50 sm:text-right">{helperText}</span>
        ) : null}
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {options.map((option) => {
          const isActive = option.value === selected;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(option.value)}
              disabled={pending}
              className={cn(
                "group relative overflow-hidden rounded-2xl border px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                isActive
                  ? "border-white/60 bg-white/[0.12] shadow-[0_18px_60px_rgba(59,130,246,0.25)]"
                  : "border-white/10 bg-white/[0.04] hover:border-white/30 hover:bg-white/[0.08]",
                pending && "cursor-not-allowed opacity-70",
              )}
            >
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100",
                  isActive && "opacity-100",
                  "bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.28),_rgba(59,130,246,0))]",
                )}
              />
              <div className="relative z-10 space-y-1">
                <p className="text-sm font-semibold text-white/90">
                  {option.title}
                </p>
                <p className="text-xs leading-5 text-white/60">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      {error ? <p className="text-xs font-medium text-rose-300">{error}</p> : null}
      <input type="hidden" name="requestType" value={selected} />
    </div>
  );
}

type SubmitButtonProps = {
  label: string;
  pendingLabel: string;
};

function SubmitButton({ label, pendingLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/20 bg-gradient-to-r from-white/95 via-white to-white/90 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_22px_80px_rgba(15,23,42,0.45)] transition hover:border-white/40 hover:shadow-[0_26px_100px_rgba(15,23,42,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/60 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/70 disabled:text-slate-800 disabled:shadow-none"
      disabled={pending}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,_rgba(255,255,255,0.4),_rgba(255,255,255,0.7)_40%,_rgba(255,255,255,0.4))] opacity-0 transition duration-300 group-hover:opacity-100"
      />
      <span className="relative z-10 inline-flex items-center gap-2">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {pendingLabel}
          </>
        ) : (
          label
        )}
      </span>
    </button>
  );
}
