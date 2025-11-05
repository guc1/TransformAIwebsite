import { SignUpForm } from "@/components/auth/sign-up-form";
import { ClientAccessGate } from "@/components/auth/client-access-gate";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

interface PageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "Auth.SignUp" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function CreateAccountPage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_55%)] py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-320px] h-[640px] bg-gradient-to-b from-sky-400/20 via-transparent to-transparent blur-3xl"
      />
      <div className="container relative z-10 max-w-2xl">
        <ClientAccessGate variant="signUp">
          <SignUpForm />
        </ClientAccessGate>
      </div>
    </div>
  );
}
