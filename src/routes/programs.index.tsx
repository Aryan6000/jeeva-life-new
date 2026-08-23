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
      <header className="flex items-center justify-between py-6">
        <h1 className="text-[28px] font-bold tracking-tight text-[#112A27]">Programs</h1>
        <Link
          to="/admin"
          className="rounded-full border border-[#EAE6DF] bg-white px-4 py-2 text-[13px] font-medium text-[#112A27] transition-colors hover:bg-gray-50"
        >
          Admin view
        </Link>
      </header>

      <h2 className="pb-3 text-[16px] font-bold text-[#112A27]">Active</h2>
      <Link
        to="/programs/$id"
        params={{ id: TEZPUR_PROGRAMME.id }}
        className="relative block overflow-hidden rounded-[24px] bg-[#144C44] p-5 text-white shadow-sm transition-transform active:scale-[0.98]"
      >
        {/* Decorative leaf background */}
        <svg className="pointer-events-none absolute -bottom-10 -right-10 w-64 h-64 opacity-20 text-[#D4E1CB]" viewBox="0 0 100 100" fill="currentColor">
          <path d="M 50 100 C 50 50, 0 50, 0 50 C 0 100, 50 100, 50 100 Z" />
          <path d="M 50 100 C 50 50, 100 50, 100 50 C 100 100, 50 100, 50 100 Z" />
        </svg>

        <div className="relative z-10 flex items-start gap-4">
          <span className="flex size-[44px] shrink-0 items-center justify-center rounded-full bg-white text-[#112A27]">
            <Calendar className="size-6" strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <span className="block text-[17px] font-semibold leading-[1.3] text-white">
                {TEZPUR_PROGRAMME.name}
              </span>
              <div className="flex shrink-0 flex-col items-end gap-3">
                {registered ? (
                  <span className="rounded-full bg-[#D4E1CB] px-3 py-1 text-[12px] font-semibold text-[#144C44]">
                    Registered
                  </span>
                ) : null}
                <ChevronRight className="size-5 text-white" strokeWidth={1.5} />
              </div>
            </div>
            <span className="mt-4 block text-[14px] text-white/90">
              {TEZPUR_PROGRAMME.organisation}
            </span>
            <span className="mt-1 block text-[14px] text-white/90">
              {TEZPUR_PROGRAMME.dates} · {TEZPUR_PROGRAMME.venue}
            </span>
          </div>
        </div>
      </Link>

      <h2 className="pb-3 pt-8 text-[16px] font-bold text-[#112A27]">Upcoming programs</h2>
      <div className="space-y-4">
        {UPCOMING_PROGRAMMES.map((p) => (
          <Link
            key={p.id}
            to="/programs/$id"
            params={{ id: p.id }}
            className="relative block overflow-hidden rounded-[24px] border border-[#EAE6DF]/60 bg-white p-5 shadow-sm transition-all hover:bg-gray-50/50"
          >
            {/* Soft wave background at bottom */}
            <svg className="pointer-events-none absolute bottom-0 left-0 w-full text-[#FAF7F2]" preserveAspectRatio="none" viewBox="0 0 100 20" fill="currentColor">
              <path d="M0 20 V10 C 20 20, 40 0, 60 10 C 80 20, 100 0, 100 0 V20 H0 Z" opacity="0.6"/>
              <path d="M0 20 V15 C 30 5, 60 20, 100 10 V20 H0 Z" opacity="0.4"/>
            </svg>
            
            <div className="relative z-10 flex items-start gap-4">
              <span className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-[#EEF4EB] text-[#124B43]">
                {UPCOMING_ICONS[p.id] ?? <Calendar className="size-6" strokeWidth={1.5} />}
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-[17px] font-semibold text-[#112A27]">{p.name}</span>
                <span className="mt-1 block text-[14px] text-[#60726F] leading-snug">{p.summary}</span>
                <span className="mt-3 block text-[14px] font-medium text-[#EF755C]">{p.startsLabel}</span>
              </div>
              <ChevronRight className="mt-2 size-5 shrink-0 text-[#112A27]" strokeWidth={1.5} />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-[20px] bg-[#FAF7F2] p-4 border border-[#EAE6DF]">
        <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full text-[#60726F] font-serif text-[12px] italic border border-[#60726F]/30">
          i
        </span>
        <p className="text-[13px] text-[#60726F] font-medium leading-snug">
          Programme dates shown for upcoming programmes are indicative.
        </p>
      </div>
    </MobileShell>
  );
}
