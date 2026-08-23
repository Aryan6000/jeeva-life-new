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

      <div className="px-1 py-4">
        <h2 className="text-[20px] font-semibold text-[#112A27] mb-5">How are you feeling right now?</h2>

        <div className="rounded-[24px] border border-[#EAE6DF]/50 bg-white p-5 shadow-sm">
          <div className="divide-y divide-[#EAE6DF]/60">
            <RatingRow
              icon={<Cloud className="size-[22px]" strokeWidth={1.5} />}
              label="Stress"
              value={values.stress}
              onChange={(v) => setValues((s) => ({ ...s, stress: v }))}
            />
            <RatingRow
              icon={<Zap className="size-[22px]" strokeWidth={1.5} />}
              label="Energy"
              value={values.energy}
              onChange={(v) => setValues((s) => ({ ...s, energy: v }))}
              tone="peach"
            />
            <RatingRow
              icon={<Target className="size-[22px]" strokeWidth={1.5} />}
              label="Focus"
              value={values.focus}
              onChange={(v) => setValues((s) => ({ ...s, focus: v }))}
              tone="mint"
            />
            <RatingRow
              icon={<Smile className="size-[22px]" strokeWidth={1.5} />}
              label="Mood"
              value={values.mood}
              onChange={(v) => setValues((s) => ({ ...s, mood: v }))}
              tone="peach"
            />
          </div>
        </div>

        {todayCheckIn ? (
          <p className="pt-4 text-center text-[13px] text-[#60726F]">
            You already checked in today. Saving again updates the same record.
          </p>
        ) : null}

        <div className="pt-8 pb-10 relative z-10">
          <PrimaryButton onClick={submit} disabled={!complete} className="h-[52px] rounded-[16px] text-[16px] bg-[#124B43] hover:bg-[#0E3E37]">
            Save today's check-in
          </PrimaryButton>
        </div>
      </div>
      
      {/* Decorative leaves at bottom */}
      <div className="fixed bottom-0 right-0 z-0 pointer-events-none opacity-80">
        <svg width="240" height="180" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 180C40 140 100 120 180 180" fill="#D4E1CB" opacity="0.4" />
          <path d="M50 180C90 120 160 100 240 180" fill="#EEF4EB" opacity="0.6" />
          <path d="M160 180C160 130 200 90 240 70C230 110 210 140 190 180" fill="#60726F" opacity="0.8" />
          <path d="M190 180C170 120 190 80 230 50C210 90 200 130 190 180" fill="#124B43" opacity="0.7" />
        </svg>
      </div>
    </MobileShell>
  );
}
