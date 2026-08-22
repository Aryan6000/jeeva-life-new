import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Battery, Cloud, Heart, Moon, Target } from "lucide-react";
import { useState } from "react";
import { RatingScale } from "@/components/jeeva/controls";
import { AppBar, MobileShell, PrimaryButton } from "@/components/jeeva/shell";
import { DIMENSIONS } from "@/lib/jeeva/scoring";
import { useJeeva } from "@/lib/jeeva/store";
import type { DimensionKey } from "@/lib/jeeva/types";

export const Route = createFileRoute("/onboarding/assessment")({
  head: () => ({
    meta: [
      { title: "Baseline assessment — JeevaLife" },
      {
        name: "description",
        content: "Answer five short questions about stress, focus, energy, sleep and emotional wellbeing to set your JeevaLife baseline.",
      },
      { property: "og:title", content: "Baseline assessment — JeevaLife" },
      { property: "og:description", content: "Five short self-report questions set your starting point." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BaselineAssessment,
});

const ICONS: Record<DimensionKey, React.ReactNode> = {
  stress: <Cloud className="size-6" strokeWidth={1.6} />,
  focus: <Target className="size-6" strokeWidth={1.6} />,
  energy: <Battery className="size-6" strokeWidth={1.6} />,
  sleep: <Moon className="size-6" strokeWidth={1.6} />,
  emotional: <Heart className="size-6" strokeWidth={1.6} />,
};

function BaselineAssessment() {
  const navigate = useNavigate();
  const { state, submitBaseline } = useJeeva();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<DimensionKey, number>>>(
    state.baseline?.answers ?? {},
  );

  const dimension = DIMENSIONS[step]!;
  const current = answers[dimension.key] ?? null;
  const isLast = step === DIMENSIONS.length - 1;
  const complete = DIMENSIONS.every((d) => answers[d.key] !== undefined);

  const next = () => {
    if (current === null) return;
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    if (!complete) return;
    submitBaseline(answers as Record<DimensionKey, number>);
    navigate({ to: "/profile/wellbeing" });
  };

  return (
    <MobileShell bottomNav={false}>
      <AppBar title="Baseline Assessment" right={<span className="text-[12px] text-muted-foreground">{step + 1}/5</span>} />

      <div className="h-1.5 w-full rounded-full bg-primary-soft">
        <div
          className="h-1.5 rounded-full bg-primary transition-all duration-200"
          style={{ width: `${((step + 1) / DIMENSIONS.length) * 100}%` }}
        />
      </div>

      <div key={dimension.key} className="jl-card jl-fade-up mt-6 px-5 py-9 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
          {ICONS[dimension.key]}
        </span>
        <p className="mt-3 text-[13px] font-medium text-primary">{dimension.label}</p>
        <h2 className="mx-auto mt-4 max-w-[260px] text-[17px] font-semibold leading-snug">
          {dimension.question}
        </h2>
        <div className="mt-7">
          <RatingScale
            value={current}
            onChange={(v) => setAnswers((a) => ({ ...a, [dimension.key]: v }))}
            minLabel={dimension.minLabel}
            maxLabel={dimension.maxLabel}
          />
        </div>
      </div>

      <div className="pt-6">
        <PrimaryButton onClick={next} disabled={current === null}>
          {isLast ? "See my wellbeing profile" : "Next question"}
        </PrimaryButton>
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="jl-tap mt-2 w-full text-[13px] font-medium text-muted-foreground"
          >
            Previous question
          </button>
        ) : null}
      </div>
    </MobileShell>
  );
}
