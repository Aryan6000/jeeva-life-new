import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, Calendar, Moon, Target, Loader2 } from "lucide-react";
import { MobileShell } from "@/components/jeeva/shell";
import { useJeeva } from "@/lib/jeeva/store";
import { getProgrammes } from "@/lib/jeeva/firestore";
import type { Programme } from "@/lib/jeeva/types";

export const Route = createFileRoute("/programs/")({
  head: () => ({
    meta: [
      { title: "Programmes — JeevaLife" },
      { name: "description", content: "Browse active and upcoming JeevaLife wellbeing programmes." },
      { property: "og:title", content: "Programmes — JeevaLife" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Programs,
});

const PROGRAMME_ICONS: Record<string, React.ReactNode> = {
  "better-sleep": <Moon className="size-5" strokeWidth={1.7} />,
  "focus-performance": <Target className="size-5" strokeWidth={1.7} />,
};

function Programs() {
  const { state } = useJeeva();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProgrammes()
      .then(setProgrammes)
      .catch(() => {/* show empty state */})
      .finally(() => setLoading(false));
  }, []);

  const active = programmes.filter((p) => p.active);
  const upcoming = programmes.filter((p) => !p.active);

  return (
    <MobileShell>
      <header className="py-4">
        <h1 className="text-[20px] font-semibold tracking-tight">Programs</h1>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <>
              <h2 className="pb-2 text-[13px] font-semibold">Active</h2>
              <div className="space-y-3">
                {active.map((p) => {
                  const registered = state.participations[p.id]?.status === "joined";
                  return (
                    <Link
                      key={p.id}
                      to="/programs/$id"
                      params={{ id: p.id }}
                      className="jl-card flex items-start gap-3 bg-primary-soft/60 p-4"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary">
                        <Calendar className="size-5" strokeWidth={1.7} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-semibold leading-snug text-primary-dark">{p.name}</span>
                        <span className="mt-1 block text-[12px] text-muted-foreground">{p.organisation}</span>
                        <span className="mt-1 block text-[12px] text-muted-foreground">
                          {p.dates} · {p.venue}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-2">
                        {registered && (
                          <span className="rounded-full bg-mint px-2 py-0.5 text-[10px] font-semibold text-mint-foreground">
                            Registered
                          </span>
                        )}
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {upcoming.length > 0 && (
            <>
              <h2 className="pb-2 pt-6 text-[13px] font-semibold">Upcoming programs</h2>
              <div className="space-y-3">
                {upcoming.map((p) => (
                  <Link
                    key={p.id}
                    to="/programs/$id"
                    params={{ id: p.id }}
                    className="jl-card flex items-center gap-3 p-4"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      {PROGRAMME_ICONS[p.id] ?? <Calendar className="size-5" strokeWidth={1.7} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium">{p.name}</span>
                      {p.summary && <span className="block text-[12px] text-muted-foreground">{p.summary}</span>}
                      {p.startsLabel && <span className="mt-1 block text-[11px] text-muted-foreground">{p.startsLabel}</span>}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </>
          )}

          {programmes.length === 0 && (
            <p className="py-16 text-center text-[13px] text-muted-foreground">
              No programmes available yet.
            </p>
          )}
        </>
      )}
    </MobileShell>
  );
}
