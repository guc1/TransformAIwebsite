"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, Lock, Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const STAFF_INTENT_ENDPOINT = "/api/auth/intent";
const REGISTER_ENDPOINT = "/api/auth/register";

export function SignUpForm() {
  const t = useTranslations("Auth.SignUp");
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [staffCodeInput, setStaffCodeInput] = useState("");
  const [staffCode, setStaffCode] = useState<string | null>(null);
  const [staffIntentError, setStaffIntentError] = useState<string | null>(null);
  const [isVerifyingStaff, setIsVerifyingStaff] = useState(false);

  const resetErrors = () => {
    setError(null);
    setStaffIntentError(null);
  };

  const prepareIntent = async (role: "client" | "staff", code?: string) => {
    const response = await fetch(STAFF_INTENT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, staffCode: code }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const message = body?.error ?? t("errors.intentFailed");
      throw new Error(message);
    }
  };

  const handleStaffSubmit = async () => {
    resetErrors();
    setIsVerifyingStaff(true);

    try {
      await prepareIntent("staff", staffCodeInput.trim());
      setIsStaff(true);
      setStaffCode(staffCodeInput.trim());
      setStaffDialogOpen(false);
    } catch (intentError) {
      setStaffIntentError(intentError instanceof Error ? intentError.message : t("errors.intentFailed"));
    } finally {
      setIsVerifyingStaff(false);
    }
  };

  const handleGoogleSignUp = async () => {
    resetErrors();
    setIsGoogleSubmitting(true);

    try {
      if (isStaff) {
        const code = (staffCode ?? staffCodeInput).trim();
        if (!code) {
          setStaffIntentError(t("errors.invalidStaffCode"));
          setIsGoogleSubmitting(false);
          return;
        }
        await prepareIntent("staff", code);
        setStaffCode(code);
      } else {
        await prepareIntent("client");
      }

      await signIn("google", {
        callbackUrl: "/auth/post-signin",
      });
    } catch (intentError) {
      setError(intentError instanceof Error ? intentError.message : t("errors.intentFailed"));
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetErrors();
    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim();
      const payload: {
        name?: string;
        email: string;
        password: string;
        role: "client" | "staff";
        staffCode?: string;
      } = {
        name: name.trim() || undefined,
        email: normalizedEmail,
        password,
        role: isStaff ? "staff" : "client",
      };

      if (isStaff) {
        const code = (staffCode ?? staffCodeInput).trim();
        if (!code) {
          setError(t("errors.invalidStaffCode"));
          setIsSubmitting(false);
          return;
        }
        payload.staffCode = code;
      }

      const response = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 409) {
          setError(t("errors.emailInUse"));
        } else if (response.status === 401) {
          setError(t("errors.invalidStaffCode"));
        } else if (response.status === 400) {
          const firstFieldError = Object.values<string[]>(data?.errors ?? {})[0]?.[0];
          setError(firstFieldError ?? t("errors.validation"));
        } else {
          setError(t("errors.generic"));
        }
        setIsSubmitting(false);
        return;
      }

      const signInResponse = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (signInResponse?.error) {
        setError(t("errors.signInAfterRegister"));
        setIsSubmitting(false);
        return;
      }

      router.push("/auth/post-signin");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t("errors.generic"));
      setIsSubmitting(false);
    }
  };

  const disableSubmit = isSubmitting || isGoogleSubmitting || isVerifyingStaff;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">{t("eyebrow")}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t("title")}</h1>
          <p className="text-sm text-white/60">{t("subtitle")}</p>
        </div>
        <div className="relative">
          <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:border-white/30 hover:text-white"
              >
                {isStaff ? t("staffModeOn") : t("staffButton")}
              </button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-950 text-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-white">
                  {t("staffDialog.title")}
                </DialogTitle>
                <DialogDescription className="text-sm text-white/60">
                  {t("staffDialog.description")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-code" className="text-white/80">
                    {t("staffDialog.codeLabel")}
                  </Label>
                  <Input
                    id="staff-code"
                    type="password"
                    value={staffCodeInput}
                    onChange={(event) => setStaffCodeInput(event.target.value)}
                    placeholder={t("staffDialog.codePlaceholder")}
                    autoComplete="one-time-code"
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-white/40"
                  />
                  {staffIntentError ? (
                    <p className="text-sm text-red-400">{staffIntentError}</p>
                  ) : null}
                </div>
              </div>
              <DialogFooter className="sm:justify-between">
                {isStaff ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-white/70 hover:text-white"
                    onClick={() => {
                      setIsStaff(false);
                      setStaffCode(null);
                      setStaffCodeInput("");
                    }}
                    disabled={isVerifyingStaff}
                  >
                    {t("staffDialog.reset")}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  className="bg-white text-black hover:bg-white/90"
                  onClick={handleStaffSubmit}
                  disabled={isVerifyingStaff || !staffCodeInput.trim()}
                >
                  {isVerifyingStaff ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  {t("staffDialog.submit")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border border-white/10 bg-black/40 p-8 shadow-[0_40px_120px_-60px_rgba(96,165,250,0.45)] backdrop-blur-xl">
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/15"
          disabled={disableSubmit}
        >
          {isGoogleSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="h-5 w-5"
              aria-hidden
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.72 1.22 9.21 3.6l6.85-6.85C35.9 2.7 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.38 13.39 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.64-.15-3.21-.44-4.73H24v9h13.09c-.56 2.83-2.26 5.24-4.84 6.86l7.73 6c4.52-4.18 7-10.35 7-17.13z"
              />
              <path
                fill="#FBBC05"
                d="M10.54 28.61a14.45 14.45 0 0 1 0-9.22l-7.98-6.19C.94 16.07 0 19.88 0 24c0 4.02.94 7.76 2.56 11.14l7.98-6.53z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.15 1.45-4.93 2.29-8.17 2.29-6.26 0-11.63-3.89-13.5-9.35l-7.98 6.53C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
          )}
          {t("googleCta")}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black/60 px-3 text-white/40">{t("or")}</span>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/80">
              {t("nameLabel")}
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("namePlaceholder")}
              autoComplete="name"
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-white/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">
              {t("emailLabel")}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("emailPlaceholder")}
              autoComplete="email"
              required
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-white/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">
              {t("passwordLabel")}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t("passwordPlaceholder")}
              autoComplete="new-password"
              required
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-white/40"
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button
            type="submit"
            className="flex w-full items-center justify-center gap-2 bg-white text-black hover:bg-white/90"
            disabled={disableSubmit}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {isStaff ? t("submitStaff") : t("submit")}
          </Button>
        </form>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
          <p className="font-medium uppercase tracking-[0.22em] text-white/50">{t("afterSubmit.title")}</p>
          <p className="mt-2 text-sm text-white/70">
            {isStaff ? t("afterSubmit.staff") : t("afterSubmit.client")}
          </p>
        </div>
      </div>

      <p className="text-center text-sm text-white/60">
        {t("haveAccount")}{" "}
        <button
          type="button"
          className="font-semibold text-white transition hover:text-white/80"
          onClick={() => router.push("/sign-in")}
          disabled={disableSubmit}
        >
          {t("signInLink")}
        </button>
      </p>
    </div>
  );
}
