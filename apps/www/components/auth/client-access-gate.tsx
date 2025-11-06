"use client";

import { useState } from "react";
import type { ReactNode, FormEvent } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CLIENT_CODE = "Cake2025";

type Variant = "signUp" | "signIn";

interface ClientAccessGateProps {
  children: ReactNode;
  variant: Variant;
}

export function ClientAccessGate({ children, variant }: ClientAccessGateProps) {
  const t = useTranslations(variant === "signUp" ? "Auth.SignUp" : "Auth.SignIn");
  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const cardShadow =
    variant === "signUp"
      ? "shadow-[0_40px_120px_-60px_rgba(96,165,250,0.45)]"
      : "shadow-[0_40px_120px_-60px_rgba(129,140,248,0.45)]";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = codeInput.trim();

    if (trimmed === CLIENT_CODE) {
      setHasAccess(true);
      setError(null);
      return;
    }

    setError(t("clientGate.error"));
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
          {t("clientGate.eyebrow")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {t("clientGate.title")}
        </h1>
        <p className="text-sm text-white/60">{t("clientGate.description")}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`space-y-5 rounded-2xl border border-white/10 bg-black/40 p-8 ${cardShadow} backdrop-blur-xl`}
      >
        <div className="space-y-2">
          <Label htmlFor="client-code" className="text-white/80">
            {t("clientGate.label")}
          </Label>
          <Input
            id="client-code"
            type="password"
            value={codeInput}
            onChange={(event) => {
              setCodeInput(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            placeholder={t("clientGate.placeholder")}
            autoComplete="one-time-code"
            className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-white/40"
          />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <Button type="submit" className="w-full bg-white text-black hover:bg-white/90">
          {t("clientGate.submit")}
        </Button>
        <p className="text-xs text-white/50">{t("clientGate.hint")}</p>
      </form>
    </div>
  );
}
