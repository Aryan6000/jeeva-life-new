import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Cloud, Smile, Target, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RatingRow } from "@/components/jeeva/controls";
import { AppBar, MobileShell, PrimaryButton } from "@/components/jeeva/shell";
import { useJeeva } from "@/lib/jeeva/store";

export const Route = createFileRoute("/check-in")({
  head: () => ({
    meta: [
      { title: "Daily check-in — JeevaLife" },
      {
        name: "description",
        content: "Rate stress, energy, focus and mood in one quick JeevaLife check-in — one record per day.",
      },
      { property: "og:title", content: "Daily check-in — JeevaLife" },
      { property: "og:description", content: "How are you feeling right now? Save today's check-in in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckInScreen,
});

type Values = { stress: number | null; energy: number | null; focus: number | null; mood: number | null };

function CheckInScreen() {
  const navigate = useNavigate();
  const { todayCheckIn, saveCheckIn } = useJeeva();
  const [values, setValues] = useState<Values>({ stress: null, energy: null, focus: null, mood: null });

  useEffect(() => {
    if (todayCheckIn) {
      setValues({
        stress: todayCheckIn.stress,
        energy: todayCheckIn.energy,
        focus: todayCheckIn.focus,
        mood: todayCheckIn.mood,
      });
    }
  }, [todayCheckIn]);

  const complete = Object.values(values).every((v) => v !== null);

  const submit = () => {
    if (!complete) return;
    saveCheckIn({
      stress: values.stress!,
      energy: values.energy!,
      focus: values.focus!,
      mood: values.mood!,
    });
    toast.success(todayCheckIn ? "Today's check-in updated" : "Today's check-in saved");
    navigate({ to: "/home" });
  };

  return (
    <MobileShell bottomNav={false}>
      <AppBar title="Daily Check-in" />

      <div className="jl-card px-4 py-5">
        <p className="text-center text-[14px] font-medium">How are you feeling right now?</p>

        <div className="mt-4 divide-y divide-border">
          <RatingRow
            icon={<Cloud className="size-4" strokeWidth={1.8} />}
            label="Stress"
            value={values.stress}
            onChange={(v) => setValues((s) => ({ ...s, stress: v }))}
          />
          <RatingRow
            icon={<Zap className="size-4" strokeWidth={1.8} />}
            label="Energy"
            value={values.energy}
            onChange={(v) => setValues((s) => ({ ...s, energy: v }))}
            tone="peach"
          />
          <RatingRow
            icon={<Target className="size-4" strokeWidth={1.8} />}
            label="Focus"
            value={values.focus}
            onChange={(v) => setValues((s) => ({ ...s, focus: v }))}
            tone="mint"
          />
          <RatingRow
            icon={<Smile className="size-4" strokeWidth={1.8} />}
            label="Mood"
            value={values.mood}
            onChange={(v) => setValues((s) => ({ ...s, mood: v }))}
            tone="peach"
          />
        </div>
      </div>

      {todayCheckIn ? (
        <p className="pt-3 text-center text-[11px] text-muted-foreground">
          You already checked in today. Saving again updates the same record.
        </p>
      ) : null}

      <div className="pt-6">
        <PrimaryButton onClick={submit} disabled={!complete}>
          Save today&apos;s check-in
        </PrimaryButton>
      </div>
    </MobileShell>
  );
}
