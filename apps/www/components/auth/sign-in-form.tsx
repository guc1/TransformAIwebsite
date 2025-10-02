"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, LogIn } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm() {
  const t = useTranslations("Auth.SignIn");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleSubmitting(true);

    await signIn("google", {
      callbackUrl: "/auth/post-signin",
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
      callbackUrl: "/auth/post-signin",
    });

    if (!result || result.error) {
      setError(t("errors.invalid"));
      setIsSubmitting(false);
      return;
    }

    let destination = "/auth/post-signin";
    if (result.url) {
      try {
        const parsed = new URL(result.url);
        destination = parsed.pathname + parsed.search + parsed.hash;
      } catch {
        destination = result.url;
      }
    }

    router.push(destination);
  };

  const disableButtons = isSubmitting || isGoogleSubmitting;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">{t("eyebrow")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t("title")}</h1>
        <p className="text-sm text-white/60">{t("subtitle")}</p>
      </div>

      <div className="space-y-6 rounded-2xl border border-white/10 bg-black/40 p-8 shadow-[0_40px_120px_-60px_rgba(129,140,248,0.45)] backdrop-blur-xl">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/15"
          disabled={disableButtons}
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
              autoComplete="current-password"
              required
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-white/40"
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button
            type="submit"
            className="flex w-full items-center justify-center gap-2 bg-white text-black hover:bg-white/90"
            disabled={disableButtons}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {t("submit")}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-white/60">
        {t("cta")}{" "}
        <button
          type="button"
          className="font-semibold text-white transition hover:text-white/80"
          onClick={() => router.push("/create-account")}
          disabled={disableButtons}
        >
          {t("ctaLink")}
        </button>
      </p>
    </div>
  );
}
