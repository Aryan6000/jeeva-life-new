import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Calendar, MapPin, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppBar, MobileShell, PrimaryButton } from "@/components/jeeva/shell";
import { TEZPUR_PROGRAMME, UPCOMING_PROGRAMMES } from "@/lib/jeeva/demo";
import { useJeeva } from "@/lib/jeeva/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/programs/$id")({
  head: () => ({
    meta: [
      { title: "Programme participation — JeevaLife" },
      {
        name: "description",
        content: "Review programme dates and venue, then record whether you are participating. Your response stays private.",
      },
      { property: "og:title", content: "Programme participation — JeevaLife" },
      { property: "og:description", content: "Join a JeevaLife programme and record your participation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProgrammeParticipation,
});

function ProgrammeParticipation() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { state, setParticipation } = useJeeva();

  const programme =
    id === TEZPUR_PROGRAMME.id
      ? TEZPUR_PROGRAMME
      : (UPCOMING_PROGRAMMES.find((p) => p.id === id) ?? TEZPUR_PROGRAMME);

  const existing = state.participations[programme.id];
  const [choice, setChoice] = useState<"joined" | "declined" | null>(null);

  useEffect(() => {
    if (existing) setChoice(existing.status);
  }, [existing]);

  const submit = () => {
    if (!choice) return;
    setParticipation(programme.id, choice);
    toast.success(choice === "joined" ? "Participation saved" : "Response saved");
    navigate({ to: "/programs" });
  };

  return (
    <MobileShell bottomNav={false}>
      <AppBar title="Programme Participation" />

      <div className="jl-card bg-primary-soft/60 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary">
            <Calendar className="size-5" strokeWidth={1.7} />
          </span>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold leading-snug text-primary-dark">
              {programme.name}
            </h2>
            <p className="mt-1 text-[12px] text-muted-foreground">{programme.organisation}</p>
          </div>
        </div>
        <div className="mt-4 space-y-1.5 text-[12px] text-muted-foreground">
          <p className="flex items-center gap-2">
            <Calendar className="size-3.5" strokeWidth={1.8} />
            {programme.dates}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-3.5" strokeWidth={1.8} />
            {programme.venue}
          </p>
        </div>
      </div>

      <h3 className="pb-2 pt-6 text-[13px] font-semibold">Will you be participating?</h3>
      <div className="space-y-2.5">
        {(
          [
            { key: "joined", label: "Yes, I'm joining" },
            { key: "declined", label: "No, not this time" },
          ] as const
        ).map((option) => (
          <button
            key={option.key}
            type="button"
            aria-pressed={choice === option.key}
            onClick={() => setChoice(option.key)}
            className={cn(
              "flex h-[52px] w-full items-center gap-3 rounded-xl border px-4 text-[14px] transition-colors",
              choice === option.key
                ? "border-primary bg-primary-soft font-medium text-primary-dark"
                : "border-border bg-surface text-foreground hover:bg-muted",
            )}
          >
            <span
              className={cn(
                "flex size-4.5 items-center justify-center rounded-full border",
                choice === option.key ? "border-primary" : "border-border",
              )}
            >
              {choice === option.key ? <span className="size-2.5 rounded-full bg-primary" /> : null}
            </span>
            {option.label}
          </button>
        ))}
      </div>

      <div className="jl-card mt-4 flex items-start gap-3 bg-mint p-3.5">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-mint-foreground" strokeWidth={1.9} />
        <p className="text-[12px] text-mint-foreground">
          Your response is private and used only for programme planning and reporting.
        </p>
      </div>

      <div className="pt-6">
        <PrimaryButton onClick={submit} disabled={!choice}>
          Save participation
        </PrimaryButton>
      </div>
    </MobileShell>
  );
}
