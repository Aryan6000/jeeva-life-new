import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, CheckCircle2, ChevronRight, Flower2, Plus, TrendingUp } from "lucide-react";
import { Card, MobileShell, NotificationBell } from "@/components/jeeva/shell";
import { scoreBand } from "@/lib/jeeva/scoring";
import { useJeeva } from "@/lib/jeeva/store";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Today — JeevaLife" },
      {
        name: "description",
        content: "Your daily JeevaLife dashboard: today's wellbeing indicator, check-in, recommended practice and consistency.",
      },
      { property: "og:title", content: "Today — JeevaLife" },
      { property: "og:description", content: "Check in, practise and keep your streak going in under two minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeScreen,
});

function HomeScreen() {
  const { state, hydrated, todayCheckIn, consistencyDays } = useJeeva();
  const firstName = state.profile?.name?.split(" ")[0] ?? "there";
  const baselineScore = state.baseline?.score ?? null;

  const currentScore = todayCheckIn
    ? Math.round(
        (((6 - todayCheckIn.stress) + todayCheckIn.energy + todayCheckIn.focus + todayCheckIn.mood) /
          4) *
          20,
      )
    : baselineScore;

  const change =
    currentScore !== null && baselineScore !== null ? currentScore - baselineScore : null;

  return (
    <MobileShell>
      <header className="flex items-center justify-between py-6">
        <h1 className="text-[28px] font-bold tracking-tight text-[#112A27]">Hi, {firstName}</h1>
        <NotificationBell />
      </header>

      {!hydrated ? (
        <div className="space-y-4">
          <div className="jl-card h-40 animate-pulse" />
          <div className="jl-card h-24 animate-pulse" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-[20px] bg-[#144C44] p-5 text-white shadow-sm">
            {/* Minimal SVG leaf approximation */}
            <svg className="pointer-events-none absolute -right-4 -top-8 w-48 h-48 opacity-90 text-[#D4E1CB]" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="50" fill="currentColor" />
              <path d="M 50 100 C 50 50, 0 50, 0 50 C 0 100, 50 100, 50 100 Z" fill="#60726F" opacity="0.3" />
              <path d="M 50 100 C 50 50, 100 50, 100 50 C 100 100, 50 100, 50 100 Z" fill="#124B43" opacity="0.1" />
            </svg>
            <div className="relative z-10">
              <p className="text-[14px] font-medium text-white/90">Today's wellbeing</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[48px] font-semibold leading-none">
                  {currentScore ?? "—"}
                </span>
                <span className="text-[16px] font-medium text-white/90">/100</span>
                {currentScore !== null ? (
                  <span className="rounded-full bg-[#D4E1CB] px-3 py-1 text-[13px] font-semibold text-[#144C44]">
                    {scoreBand(currentScore)}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-[14px] text-white/90 font-medium">
                Keep going, small steps matter.
              </p>
              {todayCheckIn ? (
                <Link
                  to="/check-in"
                  className="mt-6 flex h-[48px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#ED7458] text-[15px] font-semibold text-white transition-colors hover:bg-[#d9654b]"
                >
                  <CheckCircle2 className="size-5" strokeWidth={2} />
                  Checked in — review today
                </Link>
              ) : (
                <Link
                  to="/check-in"
                  className="mt-6 flex h-[48px] w-full items-center justify-center rounded-[14px] bg-[#ED7458] text-[15px] font-semibold text-white transition-colors hover:bg-[#d9654b]"
                >
                  Check in now
                </Link>
              )}
            </div>
          </div>

          <section>
            <h2 className="pb-3 text-[16px] font-bold text-[#112A27]">Recommended for you</h2>
            <Link to="/activities/log" className="flex items-center gap-4 rounded-[20px] border border-[#EAE6DF] bg-white p-4 shadow-sm transition-all hover:bg-gray-50/50">
              <span className="flex size-12 items-center justify-center rounded-full bg-[#EEF4EB] text-[#124B43]">
                <Flower2 className="size-6" strokeWidth={1.5} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-[#112A27]">Mindful meditation · 20 min</span>
                <span className="mt-0.5 block text-[13px] text-[#60726F]">
                  Calm your mind, improve focus
                </span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-[#112A27]" strokeWidth={1.5} />
            </Link>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <Card className="flex flex-col justify-between rounded-[20px] border-[#EAE6DF] p-4 shadow-sm">
              <div>
                <p className="text-[15px] font-medium text-[#112A27]">Consistency</p>
                <p className="text-[13px] text-[#60726F]">This week</p>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <span className="text-[28px] font-semibold tracking-tight text-[#112A27] leading-none">
                  {consistencyDays}/7 <span className="text-[14px] font-medium text-[#60726F]">days</span>
                </span>
                <ConsistencyRing days={consistencyDays} />
              </div>
            </Card>

            <Card className="flex flex-col justify-between rounded-[20px] border-[#EAE6DF] p-4 shadow-sm">
              <div>
                <p className="text-[15px] font-medium text-[#112A27]">Progress</p>
                <p className="text-[13px] text-[#60726F]">vs baseline</p>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <span className="text-[28px] font-semibold tracking-tight text-[#112A27] leading-none">
                  {change === null ? "—" : `${change >= 0 ? "+" : ""}${change}`}
                  <span className="text-[14px] font-medium text-[#60726F] ml-1">points</span>
                </span>
                <span className="flex size-[34px] items-center justify-center rounded-full bg-[#D4E1CB] text-[#124B43] mb-1">
                  <TrendingUp className="size-[18px]" strokeWidth={2} />
                </span>
              </div>
            </Card>
          </div>

          <section>
            <h2 className="pb-3 text-[16px] font-bold text-[#112A27]">Quick actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/activities/log" className="flex items-center gap-3 rounded-[20px] border border-[#EAE6DF] bg-white p-4 shadow-sm transition-all hover:bg-gray-50/50">
                <span className="flex size-10 items-center justify-center rounded-full bg-[#EEF4EB] text-[#124B43]">
                  <Plus className="size-5" strokeWidth={2} />
                </span>
                <span className="text-[14px] font-semibold text-[#112A27]">Log activity</span>
              </Link>
              <Link
                to="/programs/$id"
                params={{ id: "cche-2026" }}
                className="flex items-center gap-3 rounded-[20px] border border-[#EAE6DF] bg-white p-4 shadow-sm transition-all hover:bg-gray-50/50"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-[#FFF2EC] text-[#EF755C]">
                  <Calendar className="size-5" strokeWidth={1.8} />
                </span>
                <span className="text-[14px] font-semibold leading-tight text-[#112A27]">Tezpur<br/>programme</span>
              </Link>
            </div>
          </section>
        </div>
      )}
    </MobileShell>
  );
}

function ConsistencyRing({ days }: { days: number }) {
  const pct = Math.min(days / 7, 1);
  const r = 16;
  const c = 2 * Math.PI * r;
  return (
    <svg width={36} height={36} className="-rotate-90 mb-1">
      <circle cx={18} cy={18} r={r} fill="none" stroke="#EEF4EB" strokeWidth={4} />
      <circle
        cx={18}
        cy={18}
        r={r}
        fill="none"
        stroke="#D4E1CB"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
      />
    </svg>
  );
}
