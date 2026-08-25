import { createFileRoute, Link } from "@tanstack/react-router";
import { Battery, Cloud, Moon, Target } from "lucide-react";
import { ScoreRing } from "@/components/jeeva/controls";
import { AppBar, MobileShell } from "@/components/jeeva/shell";
import { DIMENSION_LABELS, scoreBand } from "@/lib/jeeva/scoring";
import { useJeeva } from "@/lib/jeeva/store";
import type { DimensionKey } from "@/lib/jeeva/types";

export const Route = createFileRoute("/profile/wellbeing")({
  head: () => ({
    meta: [
      { title: "Your wellbeing score — JeevaLife" },
      { name: "description", content: "See your JeevaLife baseline wellbeing score across stress, focus, energy and sleep." },
      { property: "og:title", content: "Your wellbeing score — JeevaLife" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: WellbeingProfile,
});

// 4 baseline dimensions (emotional is check-in only)
const ORDER: DimensionKey[] = ["stress", "focus", "energy", "sleep"];

const ICONS: Record<DimensionKey, React.ReactNode> = {
  stress:    <Cloud  className="size-4" strokeWidth={1.7} />,
  focus:     <Target className="size-4" strokeWidth={1.7} />,
  energy:    <Battery className="size-4" strokeWidth={1.7} />,
  sleep:     <Moon   className="size-4" strokeWidth={1.7} />,
  emotional: null,
};

const COLORS: Record<DimensionKey, string> = {
  stress:    "var(--color-primary)",
  focus:     "var(--color-mint-foreground)",
  energy:    "var(--color-peach-foreground)",
  sleep:     "var(--color-chart-4, var(--color-primary-dark))",
  emotional: "var(--color-primary-dark)",
};

function WellbeingProfile() {
  const { state, hydrated } = useJeeva();
  const baseline = state.baseline;

  return (
    <MobileShell bottomNav={false}>
      <AppBar title="Wellbeing Score" />

      {!hydrated ? (
        <div className="jl-card h-72 animate-pulse" />
      ) : !baseline ? (
        <div className="jl-card p-6 text-center">
          <p className="text-[14px] font-medium">No baseline yet</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Complete the four baseline questions to see your starting point.
          </p>
          <Link
            to="/onboarding/assessment"
            className="mt-5 inline-flex h-[46px] items-center justify-center rounded-xl bg-primary px-5 text-[14px] font-semibold text-primary-foreground"
          >
            Start assessment
          </Link>
        </div>
      ) : (
        <>
          {/* Overall score ring */}
          <div className="jl-card jl-fade-up flex flex-col items-center px-5 py-7">
            <p className="text-[13px] font-medium text-muted-foreground">Your wellbeing score</p>
            <div className="mt-4">
              <ScoreRing score={baseline.score} />
            </div>
            <p className="mt-3 text-[13px] font-medium text-primary">{scoreBand(baseline.score)}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">4 questions × 25 points = 100 total</p>
          </div>

          {/* Dimension breakdown — each out of 25 */}
          <div className="jl-card mt-4 divide-y divide-border px-4">
            {ORDER.map((key) => {
              const pts = baseline.dimensions[key] ?? 0;
              const pct = Math.round((pts / 25) * 100);
              return (
                <div key={key} className="flex items-center gap-3 py-3">
                  <span className="text-muted-foreground">{ICONS[key]}</span>
                  <span className="w-[130px] shrink-0 truncate text-[13px]">
                    {DIMENSION_LABELS[key]}
                  </span>
                  <div className="h-1.5 flex-1 rounded-full bg-primary-soft">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: COLORS[key] }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right text-[12px] font-medium text-muted-foreground">
                    {pts}/25
                  </span>
                </div>
              );
            })}
          </div>

          <p className="pt-4 text-center text-[11px] text-muted-foreground">
            Self-reported wellbeing indicator. Not a medical assessment or diagnosis.
          </p>

          <div className="pt-6">
            <Link
              to="/home"
              className="flex h-[50px] w-full items-center justify-center rounded-xl bg-primary text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              Go to Home
            </Link>
          </div>
        </>
      )}
    </MobileShell>
  );
}
