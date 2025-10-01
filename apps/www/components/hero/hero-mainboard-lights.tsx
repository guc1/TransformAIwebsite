import { cn } from "@/lib/utils";

type HeroMainboardLightsProps = {
  className?: string;
};

export function HeroMainboardLights({ className }: HeroMainboardLightsProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen",
        className,
      )}
      aria-hidden="true"
    >
      <div
        className="absolute left-[-40%] top-[18%] h-px w-[180%] bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70 blur-[1px] motion-safe:animate-mainboard-light-horizontal"
        style={{ animationDelay: "0s", animationDuration: "6s" }}
      />
      <div
        className="absolute left-[-35%] top-[52%] h-[2px] w-[190%] bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-80 blur-[2px] motion-safe:animate-mainboard-light-horizontal"
        style={{ animationDelay: "2.25s", animationDuration: "7.5s" }}
      />
      <div
        className="absolute left-[-45%] top-[78%] h-px w-[200%] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-60 blur-[1px] motion-safe:animate-mainboard-light-horizontal"
        style={{ animationDelay: "4.5s", animationDuration: "8s" }}
      />
      <div
        className="absolute left-[-30%] top-[-10%] h-[2px] w-[200%] rotate-[-12deg] bg-gradient-to-r from-transparent via-white/55 to-transparent opacity-70 blur-[2px] motion-safe:animate-mainboard-light-diagonal"
        style={{ animationDelay: "1.5s", animationDuration: "9s" }}
      />
      <div
        className="absolute top-[-35%] left-[48%] h-[170%] w-px bg-gradient-to-b from-transparent via-white/50 to-transparent opacity-60 blur-[2px] motion-safe:animate-mainboard-light-vertical"
        style={{ animationDelay: "3s", animationDuration: "7s" }}
      />
    </div>
  );
}
