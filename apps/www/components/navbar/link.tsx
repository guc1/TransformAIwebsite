"use client";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useSelectedLayoutSegment } from "next/navigation";

type Props = { href: string; label: string; external?: boolean };

export const DesktopNavLink: React.FC<Props> = ({ href, label, external }) => {
  const segment = useSelectedLayoutSegment();
  const isActive = segment
    ? href.startsWith(`/${segment}`)
    : href === "/";

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "group relative inline-flex items-center rounded-full border border-white/10 px-5 py-2 text-[15px] font-medium text-white/75 transition-all duration-300 ease-out backdrop-blur-sm",
        "hover:border-white/20 hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        isActive ? "border-sky-400/40 bg-white/5 text-white" : undefined,
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-1 rounded-full bg-sky-400/30 opacity-0 blur-lg transition duration-300 ease-out",
          isActive ? "opacity-100" : undefined,
        )}
      />
      <span className="relative z-10 tracking-[0.04em]">{label}</span>
    </Link>
  );
};

export function MobileNavLink({
  href,
  label,
  external,
  onClick,
}: { href: string; label: string; external?: boolean; onClick: () => void }) {
  const segment = useSelectedLayoutSegment();
  const router = useRouter();

  const isActive = segment
    ? href.startsWith(`/${segment}`)
    : href === "/";

  return (
    <button
      type="button"
      className={cn(
        "text-white/50 hover:text-white duration-200 text-lg font-medium tracking-[0.07px] py-3",
        {
          "text-white": isActive,
        },
      )}
      onClick={() => {
        onClick();
        if (external) {
          window.open(href, "_blank", "noopener,noreferrer");
          return;
        }

        void router.push(href);
      }}
    >
      {label}
    </button>
  );
}
