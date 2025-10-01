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
        "text-white/50 hover:text-white/90 duration-200 text-sm tracking-[0.07px]",
        {
          "text-white": isActive,
        },
      )}
    >
      {label}
    </Link>
  );
};

export function MobileNavLink({
  href,
  label,
  external,
  onClick,
  isHome = false,
}: {
  href: string;
  label: string;
  external?: boolean;
  onClick: () => void;
  isHome?: boolean;
}) {
  const segment = useSelectedLayoutSegment();
  const router = useRouter();

  const isActive = segment
    ? href.startsWith(`/${segment}`)
    : isHome;

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
