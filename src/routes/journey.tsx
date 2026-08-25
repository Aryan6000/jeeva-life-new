import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Info, TrendingUp, Activity, ArrowUpRight } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkline } from "@/components/jeeva/controls";
import { MobileShell } from "@/components/jeeva/shell";
import { useJeeva } from "@/lib/jeeva/store";
import { dateKey } from "@/lib/jeeva/scoring";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "My journey — JeevaLife" },
      { name: "description", content: "Compare your baseline with your current wellbeing over 30, 60 or 90 days." },
      { property: "og:title", content: "My journey — JeevaLife" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Journey,
});

const RANGES = ["30", "60", "90"] as const;

function checkInScore(ci: { stress: number; energy: number; focus: number; mood: number }): number {
  return Math.min(100, Math.round((ci.stress + ci.energy + ci.focus + ci.mood) * 5));
}

function Journey() {
  const { state, todayCheckIn } = useJeeva();
  const [range, setRange] = useState<(typeof RANGES)[number]>("30");

  const baseline = state.baseline?.score ?? null;
  const current = todayCheckIn ? checkInScore(todayCheckIn) : baseline;
  const change = baseline !== null && current !== null ? current - baseline : null;

  // Build trend from real check-ins
  const trend = useMemo(() => {
    const days = parseInt(range);
    const points: { label: string; score: number }[] = [];
    const buckets = Math.ceil(days / 7);
    for (let i = buckets - 1; i >= 0; i--) {
      const bucketEnd = subDays(new Date(), i * 7);
      const scores: number[] = [];
      for (let d = 0; d <= 6; d++) {
        const k = dateKey(subDays(bucketEnd, d));
        const ci = state.checkIns[k];
        if (ci) scores.push(checkInScore(ci));
      }
      if (scores.length > 0) {
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        points.push({ label: format(subDays(bucketEnd, 6), "MMM d"), score: avg });
      }
    }
    if (points.length === 0 && baseline !== null) {
      points.push({ label: "Baseline", score: baseline });
    }
    return points;
  }, [range, state.checkIns, baseline]);

  // Consistency calculations
  const last7ActivityDays = useMemo(() => {
    const s = new Set(state.activities.map((a) => a.dateKey));
    let c = 0;
    for (let i = 0; i < 7; i++) if (s.has(dateKey(subDays(new Date(), i)))) c++;
    return c;
  }, [state.activities]);

  const last7CheckInDays = useMemo(() => {
    let c = 0;
    for (let i = 0; i < 7; i++) if (state.checkIns[dateKey(subDays(new Date(), i))]) c++;
    return c;
  }, [state.checkIns]);

  const practiceTrend = useMemo(() => {
    const s = new Set(state.activities.map((a) => a.dateKey));
    return Array.from({ length: 7 }, (_, i) =>
      s.has(dateKey(subDays(new Date(), 6 - i))) ? 1 : 0,
    );
  }, [state.activities]);

  const checkInTrend = useMemo(() =>
    Array.from({ length: 7 }, (_, i) =>
      state.checkIns[dateKey(subDays(new Date(), 6 - i))] ? 1 : 0,
    ),
    [state.checkIns],
  );

  const practiceConsistency = Math.round((last7ActivityDays / 7) * 100);
  const checkInConsistency = Math.round((last7CheckInDays / 7) * 100);

  return (
    <MobileShell>
      {/* Header */}
      <header className="flex items-center justify-between py-4">
        <h1 className="text-[22px] font-bold tracking-tight">My Journey</h1>
        <button type="button" aria-label="Info" className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
          <Info className="size-4" strokeWidth={1.8} />
        </button>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard
          icon={<TrendingUp className="size-4" strokeWidth={2} />}
          iconBg="bg-peach"
          iconColor="text-peach-foreground"
          label="Baseline"
          value={baseline ?? "—"}
        />
        <StatCard
          icon={<Activity className="size-4" strokeWidth={2} />}
          iconBg="bg-primary"
          iconColor="text-white"
          label="Current"
          value={current ?? "—"}
          highlight
        />
        <StatCard
          icon={<ArrowUpRight className="size-4" strokeWidth={2} />}
          iconBg="bg-primary-soft"
          iconColor="text-primary"
          label="Change"
          value={change === null ? "—" : `${change >= 0 ? "+" : ""}${change}`}
        />
      </div>

      {/* Range pills */}
      <div className="mt-4 flex gap-2">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={cn(
              "h-9 flex-1 rounded-full text-[13px] font-medium transition-all",
              range === r
                ? "bg-primary text-white shadow-sm"
                : "border border-border bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            {r} days
          </button>
        ))}
      </div>

      {/* Trend chart */}
      <div className="jl-card mt-4 p-4">
        <p className="text-[14px] font-semibold">Wellbeing score trend</p>
        {trend.length === 0 || (trend.length === 1 && trend[0]?.label === "Baseline") ? (
          <p className="mt-4 py-8 text-center text-[12px] text-muted-foreground">
            No check-in data yet. Start checking in to see your trend.
          </p>
        ) : (
          <div className="mt-3 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    fontSize: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: "var(--color-primary)", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "var(--color-primary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Consistency cards */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <ConsistencyCard
          icon={<Activity className="size-4" strokeWidth={1.8} />}
          label="Practice consistency"
          pct={practiceConsistency}
          trend={practiceTrend}
          trendColor="var(--color-peach-foreground)"
        />
        <ConsistencyCard
          icon={<TrendingUp className="size-4" strokeWidth={1.8} />}
          label="Check-in consistency"
          pct={checkInConsistency}
          trend={checkInTrend}
          trendColor="var(--color-primary)"
        />
      </div>

      {/* Footer note */}
      <p className="mt-4 rounded-xl border border-border bg-surface px-3.5 py-3 text-[11px] text-muted-foreground">
        <Info className="mr-1.5 inline size-3 align-middle" strokeWidth={1.8} />
        Self-reported wellbeing indicator showing change over time. Not a medical assessment.
      </p>

      {!state.baseline ? (
        <Link
          to="/onboarding/assessment"
          className="mt-4 flex h-[46px] items-center justify-center rounded-xl border border-primary text-[14px] font-medium text-primary"
        >
          Complete your baseline →
        </Link>
      ) : null}
    </MobileShell>
  );
}

function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "jl-card flex flex-col items-center gap-2 py-4",
      highlight ? "border-primary/20 bg-primary-soft" : "",
    )}>
      <span className={cn("flex size-9 items-center justify-center rounded-xl", iconBg, iconColor)}>
        {icon}
      </span>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("text-[24px] font-bold leading-none", highlight ? "text-primary" : "text-foreground")}>
        {value}
      </p>
    </div>
  );
}

function ConsistencyCard({
  icon,
  label,
  pct,
  trend,
  trendColor,
}: {
  icon: React.ReactNode;
  label: string;
  pct: number;
  trend: number[];
  trendColor: string;
}) {
  return (
    <div className="jl-card p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
          {icon}
        </span>
        <p className="text-[12px] font-medium leading-tight">{label}</p>
      </div>
      <p className="mt-3 text-[28px] font-bold leading-none">{pct}%</p>
      <div className="mt-2">
        <Sparkline points={trend} color={trendColor} />
      </div>
    </div>
  );
}
