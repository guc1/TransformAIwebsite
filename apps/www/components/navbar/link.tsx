"use client";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Props = { href: string; label: string; external?: boolean };

export const DesktopNavLink: React.FC<Props> = ({ href, label, external }) => {
  const pathname = usePathname();
  const normalizedPathname = getNormalizedPathname(pathname);
  const isActive = isPathActive(normalizedPathname, href);

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "group relative inline-flex items-center rounded-full border border-white/10 px-5 py-2 text-[15px] font-medium tracking-[0.04em] text-white/70 transition-all duration-300 ease-out backdrop-blur-sm",
        "hover:border-sky-400/30 hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        isActive ? "border-sky-400/50 bg-sky-500/10 text-white" : undefined,
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-2 rounded-full bg-sky-500/35 opacity-0 blur-2xl transition duration-300 ease-out",
          isActive ? "opacity-100" : "group-hover:opacity-40",
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
  const pathname = usePathname();
  const router = useRouter();
  const normalizedPathname = getNormalizedPathname(pathname);
  const isActive = isPathActive(normalizedPathname, href);

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

function getNormalizedPathname(pathname: string | null) {
  if (!pathname) {
    return "/";
  }

  const trimmedPathname =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  const localeStrippedPath = locales.reduce((current, code) => {
    const prefix = `/${code}`;

    if (current === prefix) {
      return "/";
    }

    if (current.startsWith(`${prefix}/`)) {
      return current.slice(prefix.length) || "/";
    }

    return current;
  }, trimmedPathname);

  return localeStrippedPath.length === 0 ? "/" : localeStrippedPath;
}

function isPathActive(currentPath: string, href: string) {
  if (href === "/") {
    return currentPath === "/";
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}
