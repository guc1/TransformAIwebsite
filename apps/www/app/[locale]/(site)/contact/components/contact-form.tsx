"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert/alert";
import { cn } from "@/lib/utils";

import {
  CONTACT_REQUEST_TYPES,
  type ContactRequestType,
} from "../constants";
import { initialState, sendContactMessage } from "../server/send-message";
import { RequestTypeSelector } from "./request-type-selector";

type FieldName = "name" | "company" | "email";

type FieldConfig = {
  name: FieldName;
  type?: string;
  autoComplete?: string;
  label: string;
  placeholder: string;
  required?: boolean;
};

const fieldClassName =
  "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:border-white/40 transition disabled:cursor-not-allowed disabled:opacity-60";

interface ContactFormProps {
  locale: string;
}

export function ContactForm({ locale }: ContactFormProps) {
  const t = useTranslations("Contact.Form");
  const [state, formAction] = useFormState(sendContactMessage, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [requestType, setRequestType] = useState<ContactRequestType>(
    CONTACT_REQUEST_TYPES[0].value,
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setRequestType(CONTACT_REQUEST_TYPES[0].value);
    }
  }, [state]);

  const requestTypeOptions = useMemo(
    () =>
      CONTACT_REQUEST_TYPES.map((option) => ({
        value: option.value,
        title: t(`requestTypes.${option.translationKey}.title`),
        description: t(`requestTypes.${option.translationKey}.description`),
      })),
    [t],
  );

  const fields: FieldConfig[] = [
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
      required: true,
    },
  ];

  return (
    <div className="relative isolate overflow-hidden rounded-[32px] border border-white/15 bg-white/[0.04] p-6 sm:p-8 shadow-[0_28px_120px_rgba(15,23,42,0.45)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_rgba(59,130,246,0))] blur-3xl"
      />
      <form ref={formRef} action={formAction} className="relative z-10 space-y-6">
        <div className="space-y-4">
          <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
            {t("badge")}
          </span>
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-white sm:text-3xl">{t("title")}</h3>
            <p className="text-sm text-white/70 sm:text-base">{t("subtitle")}</p>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/[0.06] px-4 py-3 text-left shadow-[0_18px_80px_rgba(15,23,42,0.35)]">
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
        </div>

        {state.status === "success" && state.message ? (
          <Alert variant="success" className="border-none">
            <AlertDescription variant="success">
              <div>
                <p className="text-sm font-semibold text-white">{t("feedback.successTitle")}</p>
                <p className="mt-1 text-sm text-white/70">{state.message}</p>
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        {state.status === "error" && state.message ? (
          <Alert variant="error" className="border-none">
            <AlertDescription variant="error">
              <div>
                <p className="text-sm font-semibold text-white">{t("feedback.errorTitle")}</p>
                <p className="mt-1 text-sm text-white/70">{state.message}</p>
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        <RequestTypeSelector
          label={t("requestType.label")}
          helperText={t("requestType.helper")}
          options={requestTypeOptions}
          selected={requestType}
          onSelect={setRequestType}
          error={state.fieldErrors?.requestType}
        />

        <input type="hidden" name="locale" value={locale} />

        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(({ name, label, placeholder, type = "text", autoComplete, required }) => (
            <div
              key={name}
              className={cn("space-y-2", name === "email" ? "sm:col-span-2" : undefined)}
            >
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-white/60" htmlFor={name}>
                {label}
                {required ? <span className="ml-1 text-white/40">*</span> : null}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                autoComplete={autoComplete}
                placeholder={placeholder}
                className={cn(fieldClassName, state.fieldErrors?.[name] && "border-rose-400/70 text-white")}
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
          <label className="text-xs font-medium uppercase tracking-[0.2em] text-white/60" htmlFor="description">
            {t("fields.description.label")}
            <span className="ml-1 text-white/40">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            placeholder={t("fields.description.placeholder")}
            rows={6}
            className={cn(
              fieldClassName,
              "min-h-[160px] resize-y",
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

        <div className="pt-2">
          <SubmitButton label={t("submit.label")} pendingLabel={t("submit.pending")} />
        </div>
        <p className="text-xs leading-5 text-white/40">
          {t("footnote", { email: "info@transformai.nl" })}
        </p>
      </form>
    </div>
  );
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-r from-white via-white to-white/80 px-5 py-3 text-sm font-semibold text-black shadow-[0_16px_48px_rgba(59,130,246,0.3)] transition hover:from-white hover:via-white hover:to-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      <span>{pending ? pendingLabel : label}</span>
      {pending ? <Loader2 className="h-4 w-4 animate-spin text-black/70" aria-hidden /> : null}
    </button>
  );
}
