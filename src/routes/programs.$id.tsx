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

      <div className="px-1 py-4">
        <div className="rounded-[24px] border border-[#EAE6DF]/80 bg-[#FAF7F2] p-5">
          <div className="flex items-start gap-4">
            <span className="flex size-[44px] shrink-0 items-center justify-center rounded-[14px] border border-[#EAE6DF] bg-white text-[#112A27]">
              <Calendar className="size-6" strokeWidth={1.5} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[17px] font-semibold leading-[1.3] text-[#112A27]">
                {programme.name}
              </h2>
              <p className="mt-1.5 text-[15px] text-[#60726F]">{programme.organisation}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-[14px] text-[#60726F] font-medium">
            <p className="flex items-center gap-3">
              <Calendar className="size-5 text-[#112A27]" strokeWidth={1.5} />
              {programme.dates}
            </p>
            <p className="flex items-center gap-3">
              <MapPin className="size-5 text-[#112A27]" strokeWidth={1.5} />
              {programme.venue}
            </p>
          </div>
        </div>

        <h3 className="pb-4 pt-8 text-[17px] font-bold text-[#112A27]">Will you be participating?</h3>
        <div className="space-y-3">
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
                "flex h-[60px] w-full items-center gap-4 rounded-[16px] border px-5 text-[15px] transition-colors",
                choice === option.key
                  ? "border-[#124B43]/30 bg-[#EEF4EB] font-medium text-[#112A27]"
                  : "border-[#EAE6DF] bg-white text-[#112A27] hover:bg-gray-50",
              )}
            >
              <span
                className={cn(
                  "flex size-[22px] items-center justify-center rounded-full border-[1.5px]",
                  choice === option.key ? "border-[#124B43]" : "border-[#C4CCCB]",
                )}
              >
                {choice === option.key ? <span className="size-3 rounded-full bg-[#124B43]" /> : null}
              </span>
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-[16px] bg-[#EEF4EB] p-4 border border-[#124B43]/10">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#124B43]" strokeWidth={1.5} />
          <p className="text-[13px] text-[#124B43] font-medium leading-snug pr-4">
            Your response is private and used only for programme planning and reporting.
          </p>
        </div>

        <div className="pt-8 pb-10">
          <PrimaryButton onClick={submit} disabled={!choice} className="h-[52px] rounded-[16px] text-[16px] bg-[#124B43] hover:bg-[#0E3E37]">
            Save participation
          </PrimaryButton>
        </div>
      </div>
    </MobileShell>
  );
}
