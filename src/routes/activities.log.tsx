import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity as ActivityIcon,
  Ellipsis,
  Flower2,
  Footprints,
  Moon,
  NotebookPen,
  PersonStanding,
  Wind,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppBar, MobileShell, PrimaryButton } from "@/components/jeeva/shell";
import { ACTIVITY_TYPES } from "@/lib/jeeva/demo";
import { useJeeva } from "@/lib/jeeva/store";
import type { ActivityType } from "@/lib/jeeva/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/activities/log")({
  head: () => ({
    meta: [
      { title: "Log activity — JeevaLife" },
      {
        name: "description",
        content: "Log meditation, yoga, exercise, breathing, walking, sleep or journaling with an optional duration.",
      },
      { property: "og:title", content: "Log activity — JeevaLife" },
      { property: "og:description", content: "Record what you practised today in a few taps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LogActivity,
});

const ICONS: Record<ActivityType, React.ReactNode> = {
  meditation: <Flower2 className="size-5" strokeWidth={1.7} />,
  yoga: <PersonStanding className="size-5" strokeWidth={1.7} />,
  exercise: <ActivityIcon className="size-5" strokeWidth={1.7} />,
  breathing: <Wind className="size-5" strokeWidth={1.7} />,
  walking: <Footprints className="size-5" strokeWidth={1.7} />,
  sleep: <Moon className="size-5" strokeWidth={1.7} />,
  journaling: <NotebookPen className="size-5" strokeWidth={1.7} />,
  other: <Ellipsis className="size-5" strokeWidth={1.7} />,
};

function LogActivity() {
  const navigate = useNavigate();
  const { logActivity } = useJeeva();
  const [type, setType] = useState<ActivityType | null>(null);
  const [duration, setDuration] = useState(20);
  const [note, setNote] = useState("");

  const submit = () => {
    if (!type || duration < 1) return;
    const trimmed = note.trim();
    logActivity(
      trimmed
        ? { type, durationMinutes: duration, note: trimmed }
        : { type, durationMinutes: duration },
    );
    toast.success("Activity logged");
    navigate({ to: "/home" });
  };

  return (
    <MobileShell bottomNav={false}>
      <AppBar title="Log Activity" />

      <div className="jl-card p-4">
        <p className="text-[14px] font-medium">What did you do?</p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {ACTIVITY_TYPES.map((a) => (
            <button
              key={a.key}
              type="button"
              aria-pressed={type === a.key}
              onClick={() => setType(a.key)}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-[11px] font-medium transition-colors",
                type === a.key
                  ? "border-primary bg-primary-soft text-primary-dark"
                  : "border-border bg-background text-foreground hover:bg-muted",
              )}
            >
              <span className={cn(type === a.key ? "text-primary" : "text-primary/80")}>
                {ICONS[a.key]}
              </span>
              {a.label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <p className="text-[12px] font-medium text-muted-foreground">Duration</p>
          <div className="jl-field mt-2 flex items-center justify-between p-2">
            <button
              type="button"
              aria-label="Decrease duration"
              onClick={() => setDuration((d) => Math.max(1, d - 5))}
              className="jl-tap flex items-center justify-center rounded-full text-[18px] text-muted-foreground hover:bg-muted"
            >
              −
            </button>
            <span className="text-[15px] font-semibold">{duration} min</span>
            <button
              type="button"
              aria-label="Increase duration"
              onClick={() => setDuration((d) => Math.min(600, d + 5))}
              className="jl-tap flex items-center justify-center rounded-full text-[18px] text-muted-foreground hover:bg-muted"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[12px] font-medium text-muted-foreground">Note (optional)</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="How did it feel?"
            className="jl-field mt-2 w-full resize-none p-3 text-[14px] outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="pt-6">
        <PrimaryButton onClick={submit} disabled={!type || duration < 1}>
          Log this activity
        </PrimaryButton>
      </div>
    </MobileShell>
  );
}
