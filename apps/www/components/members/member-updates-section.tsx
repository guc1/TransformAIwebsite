import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UpdateItem {
  key: string;
  badge: string;
  title: string;
  date: string;
  summary: string;
}

interface MemberUpdatesSectionProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaNote: string;
  updates: UpdateItem[];
}

export function MemberUpdatesSection({
  eyebrow,
  title,
  subtitle,
  ctaNote,
  updates,
}: MemberUpdatesSectionProps) {
  return (
    <div className="space-y-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">{eyebrow}</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h2>
        <p className="mt-4 text-base text-white/60 sm:text-lg">{subtitle}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {updates.map((update, index) => (
          <Card
            key={update.key}
            className={cn(
              "group relative overflow-hidden border-white/10 bg-white/5 text-white backdrop-blur-xl transition",
              index === 0 ? "md:col-span-2" : "",
            )}
          >
            <CardHeader className="space-y-3 pb-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.32em] text-emerald-300/60">
                <span>{update.badge}</span>
                <span className="text-white/40">{update.date}</span>
              </div>
              <CardTitle className="text-2xl font-semibold text-white sm:text-3xl">{update.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-8 text-sm leading-relaxed text-white/70 sm:text-base">
              <p>{update.summary}</p>
              <div className="rounded-lg border border-white/10 bg-black/40 p-4 text-xs text-white/60">{ctaNote}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
