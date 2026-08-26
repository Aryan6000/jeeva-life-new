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
  const { state, hydrated, todayCheckIn, consistencyDays, streak } = useJeeva();
  const firstName = state.profile?.name?.split(" ")[0] ?? "there";
  const baselineScore = state.baseline?.score ?? null;

  const currentScore = todayCheckIn
    ? Math.min(100, Math.round(
        (todayCheckIn.stress + todayCheckIn.energy + todayCheckIn.focus + todayCheckIn.mood) * 5,
      ))
    : baselineScore;

  const change =
    currentScore !== null && baselineScore !== null ? currentScore - baselineScore : null;

  return (
    <MobileShell>
      <header className="flex items-center justify-between py-4">
        <h1 className="text-[20px] font-semibold tracking-tight">Hi, {firstName}</h1>
        <NotificationBell />
      </header>

      {!hydrated ? (
        <div className="space-y-4">
          <div className="jl-card h-40 animate-pulse" />
          <div className="jl-card h-24 animate-pulse" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="jl-card relative overflow-hidden bg-primary p-4 text-primary-foreground">
            <div className="pointer-events-none absolute -right-4 -top-4 size-28 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -right-10 top-6 size-20 rounded-full bg-white/8" />
            <div className="relative">
              <p className="text-[12px] text-white/70">Today&apos;s wellbeing</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[36px] font-semibold leading-none text-white">
                  {currentScore ?? "—"}
                </span>
                <span className="text-[13px] text-white/70">/100</span>
                {currentScore !== null ? (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white">
                    {scoreBand(currentScore)}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[12px] text-white/70">
                Keep going, small steps matter.
              </p>
              {todayCheckIn ? (
                <Link
                  to="/check-in"
                  className="mt-4 flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-white/20 text-[14px] font-semibold text-white"
                >
                  <CheckCircle2 className="size-4" strokeWidth={1.9} />
                  Checked in — review today
                </Link>
              ) : (
                <Link
                  to="/check-in"
                  className="mt-4 flex h-[46px] w-full items-center justify-center rounded-xl text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--color-cta)" }}
                >
                  Check in now
                </Link>
              )}
            </div>
          </div>

          <section>
            <h2 className="pb-2 text-[13px] font-semibold">Recommended for you</h2>
            <Link to="/activities/log" className="jl-card flex items-center gap-3 p-3.5">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Flower2 className="size-5" strokeWidth={1.7} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium">Mindful meditation · 20 min</span>
                <span className="block text-[12px] text-muted-foreground">
                  Calm your mind, improve focus
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </section>

          <div className="grid grid-cols-2 gap-3">
            <Card className="flex flex-col justify-between">
              <div>
                <p className="text-[12px] font-medium">Consistency</p>
                <p className="text-[11px] text-muted-foreground">Daily streak</p>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-[18px] font-semibold">
                  {streak} <span className="text-[12px] font-normal text-muted-foreground">
                    {streak === 1 ? "day" : "days"}
                  </span>
                </span>
                <ConsistencyRing days={consistencyDays} streak={streak} />
              </div>
              {streak > 0 && (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {todayCheckIn ? `🔥 ${streak} day streak!` : `Check in to keep your ${streak}d streak`}
                </p>
              )}
            </Card>

            <Card className="flex flex-col justify-between">
              <div>
                <p className="text-[12px] font-medium">Progress</p>
                <p className="text-[11px] text-muted-foreground">vs baseline</p>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-[18px] font-semibold">
                  {change === null ? "—" : `${change >= 0 ? "+" : ""}${change}`}{" "}
                  <span className="text-[12px] font-normal text-muted-foreground">points</span>
                </span>
                <span className="flex size-8 items-center justify-center rounded-full bg-mint text-mint-foreground">
                  <TrendingUp className="size-4" strokeWidth={1.9} />
                </span>
              </div>
            </Card>
          </div>

          <section>
            <h2 className="pb-2 text-[13px] font-semibold">Quick actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/activities/log" className="jl-card flex items-center gap-2 p-3.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Plus className="size-4" strokeWidth={2} />
                </span>
                <span className="text-[13px] font-medium">Log activity</span>
              </Link>
              <Link
                to="/programs/$id"
                params={{ id: "cche-2026" }}
                className="jl-card flex items-center gap-2 p-3.5"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-peach text-peach-foreground">
                  <Calendar className="size-4" strokeWidth={1.8} />
                </span>
                <span className="text-[13px] font-medium leading-tight">Tezpur programme</span>
              </Link>
            </div>
          </section>
        </div>
      )}
    </MobileShell>
  );
}

function ConsistencyRing({ days, streak }: { days: number; streak: number }) {
  // Ring shows last 7 days consistency (visual), color intensity based on streak
  const pct = Math.min(days / 7, 1);
  const r = 14;
  const c = 2 * Math.PI * r;
  const strokeColor = streak >= 7 ? "var(--color-peach-foreground)"
    : streak >= 3 ? "var(--color-primary)"
    : "var(--color-mint-foreground)";
  return (
    <svg width={36} height={36} className="-rotate-90">
      <circle cx={18} cy={18} r={r} fill="none" stroke="var(--color-primary-soft)" strokeWidth={4} />
      <circle
        cx={18}
        cy={18}
        r={r}
        fill="none"
        stroke={strokeColor}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
      />
    </svg>
  );
}
