import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Calendar, Moon, Target } from "lucide-react";
import { MobileShell } from "@/components/jeeva/shell";
import { TEZPUR_PROGRAMME, UPCOMING_PROGRAMMES } from "@/lib/jeeva/demo";
import { useJeeva } from "@/lib/jeeva/store";

export const Route = createFileRoute("/programs/")({
  head: () => ({
    meta: [
      { title: "Programmes — JeevaLife" },
      {
        name: "description",
        content: "Browse active and upcoming JeevaLife wellbeing programmes, including the Tezpur University 2026 event.",
      },
      { property: "og:title", content: "Programmes — JeevaLife" },
      { property: "og:description", content: "Active and upcoming wellbeing programmes you can join." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Programs,
});

const UPCOMING_ICONS: Record<string, React.ReactNode> = {
  "better-sleep": <Moon className="size-5" strokeWidth={1.7} />,
  "focus-performance": <Target className="size-5" strokeWidth={1.7} />,
};

function Programs() {
  const { state } = useJeeva();
  const registered = state.participations[TEZPUR_PROGRAMME.id]?.status === "joined";

  return (
    <MobileShell>
      <header className="flex items-center justify-between py-4">
        <h1 className="text-[20px] font-semibold tracking-tight">Programs</h1>
        <Link
          to="/admin"
          className="rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground"
        >
          Admin view
        </Link>
      </header>

      <h2 className="pb-2 text-[13px] font-semibold">Active</h2>
      <Link
        to="/programs/$id"
        params={{ id: TEZPUR_PROGRAMME.id }}
        className="jl-card flex items-start gap-3 bg-primary-soft/60 p-4"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary">
          <Calendar className="size-5" strokeWidth={1.7} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold leading-snug text-primary-dark">
            {TEZPUR_PROGRAMME.name}
          </span>
          <span className="mt-1 block text-[12px] text-muted-foreground">
            {TEZPUR_PROGRAMME.organisation}
          </span>
          <span className="mt-1 block text-[12px] text-muted-foreground">
            {TEZPUR_PROGRAMME.dates} · {TEZPUR_PROGRAMME.venue}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-2">
          {registered ? (
            <span className="rounded-full bg-mint px-2 py-0.5 text-[10px] font-semibold text-mint-foreground">
              Registered
            </span>
          ) : null}
          <ChevronRight className="size-4 text-muted-foreground" />
        </span>
      </Link>

      <h2 className="pb-2 pt-6 text-[13px] font-semibold">Upcoming programs</h2>
      <div className="space-y-3">
        {UPCOMING_PROGRAMMES.map((p) => (
          <Link
            key={p.id}
            to="/programs/$id"
            params={{ id: p.id }}
            className="jl-card flex items-center gap-3 p-4"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              {UPCOMING_ICONS[p.id] ?? <Calendar className="size-5" strokeWidth={1.7} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium">{p.name}</span>
              <span className="block text-[12px] text-muted-foreground">{p.summary}</span>
              <span className="mt-1 block text-[11px] text-muted-foreground">{p.startsLabel}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <p className="pt-5 text-center text-[11px] text-muted-foreground">
        Programme dates shown for upcoming programmes are indicative.
      </p>
    </MobileShell>
  );
}
