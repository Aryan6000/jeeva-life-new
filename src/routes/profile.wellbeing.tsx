import { createFileRoute, Link } from "@tanstack/react-router";
import { Battery, Cloud, Heart, Moon, Target } from "lucide-react";
import { DimensionBar, ScoreRing } from "@/components/jeeva/controls";
import { AppBar, MobileShell } from "@/components/jeeva/shell";
import { DIMENSION_LABELS, scoreBand } from "@/lib/jeeva/scoring";
import { useJeeva } from "@/lib/jeeva/store";
import type { DimensionKey } from "@/lib/jeeva/types";

export const Route = createFileRoute("/profile/wellbeing")({
  head: () => ({
    meta: [
      { title: "Your wellbeing profile — JeevaLife" },
      {
        name: "description",
        content: "See your computed JeevaLife starting point across stress balance, focus, energy, sleep and emotional wellbeing.",
      },
      { property: "og:title", content: "Your wellbeing profile — JeevaLife" },
      { property: "og:description", content: "A self-reported wellbeing starting point, calculated from your baseline answers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WellbeingProfile,
});

const ORDER: DimensionKey[] = ["stress", "focus", "energy", "sleep", "emotional"];

const ICONS: Record<DimensionKey, React.ReactNode> = {
  stress: <Cloud className="size-4" strokeWidth={1.7} />,
  focus: <Target className="size-4" strokeWidth={1.7} />,
  energy: <Battery className="size-4" strokeWidth={1.7} />,
  sleep: <Moon className="size-4" strokeWidth={1.7} />,
  emotional: <Heart className="size-4" strokeWidth={1.7} />,
};

const COLORS: Record<DimensionKey, string> = {
  stress: "var(--color-primary)",
  focus: "var(--color-mint-foreground)",
  energy: "var(--color-peach-foreground)",
  sleep: "var(--color-chart-4)",
  emotional: "var(--color-primary-dark)",
};

function WellbeingProfile() {
  const { state, hydrated } = useJeeva();
  const baseline = state.baseline;

  return (
    <MobileShell bottomNav={false}>
      <AppBar title="Wellbeing Profile" />

      {!hydrated ? (
        <div className="jl-card h-72 animate-pulse" />
      ) : !baseline ? (
        <div className="jl-card p-6 text-center">
          <p className="text-[14px] font-medium">No baseline yet</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Complete the five baseline questions to see your starting point.
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
          <div className="jl-card jl-fade-up flex flex-col items-center px-5 py-7">
            <p className="text-[13px] font-medium text-muted-foreground">Your starting point</p>
            <div className="mt-4">
              <ScoreRing score={baseline.score} />
            </div>
            <p className="mt-3 text-[13px] font-medium text-primary">{scoreBand(baseline.score)}</p>
          </div>

          <div className="jl-card mt-4 px-4 py-2">
            {ORDER.map((key) => (
              <DimensionBar
                key={key}
                icon={ICONS[key]}
                label={DIMENSION_LABELS[key]}
                value={baseline.dimensions[key]}
                colorVar={COLORS[key]}
              />
            ))}
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
