import { createFileRoute, Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkline, StatPill } from "@/components/jeeva/controls";
import { Card, MobileShell, SyntheticBadge } from "@/components/jeeva/shell";
import { JOURNEY_CONSISTENCY, JOURNEY_TREND } from "@/lib/jeeva/demo";
import { useJeeva } from "@/lib/jeeva/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "My journey — JeevaLife" },
      {
        name: "description",
        content: "Compare your baseline with your current self-reported wellbeing over 30, 60 or 90 days, plus practice consistency.",
      },
      { property: "og:title", content: "My journey — JeevaLife" },
      { property: "og:description", content: "Self-reported change over time across your JeevaLife practice." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Journey,
});

const RANGES = ["30", "60", "90"] as const;

function Journey() {
  const { state, todayCheckIn } = useJeeva();
  const [range, setRange] = useState<(typeof RANGES)[number]>("30");

  const baseline = state.baseline?.score ?? null;
  const current = todayCheckIn
    ? Math.round(
        (((6 - todayCheckIn.stress) + todayCheckIn.energy + todayCheckIn.focus + todayCheckIn.mood) /
          4) *
          20,
      )
    : baseline;
  const change = baseline !== null && current !== null ? current - baseline : null;

  const trend = JOURNEY_TREND[range];

  return (
    <MobileShell>
      <header className="flex items-center justify-between py-4">
        <h1 className="text-[20px] font-semibold tracking-tight">My Journey</h1>
        <span className="jl-tap flex items-center justify-end text-muted-foreground">
          <Info className="size-4" strokeWidth={1.8} />
        </span>
      </header>

      <div className="flex gap-3">
        <StatPill label="Baseline" value={baseline ?? "—"} />
        <StatPill label="Current" value={current ?? "—"} tone="primarySoft" />
        <StatPill
          label="Change"
          value={change === null ? "—" : `${change >= 0 ? "+" : ""}${change}`}
          tone="mint"
        />
      </div>

      <div className="mt-4 flex gap-2">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={cn(
              "h-9 flex-1 rounded-full border text-[12px] font-medium transition-colors",
              range === r
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            {r} days
          </button>
        ))}
      </div>

      <Card className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium">Wellbeing score trend</p>
          <SyntheticBadge />
        </div>
        <div className="mt-3 h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
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
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ r: 2.5, fill: "var(--color-primary)" }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card>
          <p className="text-[12px] font-medium">Practice consistency</p>
          <p className="mt-1 text-[20px] font-semibold">{JOURNEY_CONSISTENCY.practice}%</p>
          <Sparkline points={JOURNEY_CONSISTENCY.practiceTrend} />
        </Card>
        <Card>
          <p className="text-[12px] font-medium">Check-in consistency</p>
          <p className="mt-1 text-[20px] font-semibold">{JOURNEY_CONSISTENCY.checkIn}%</p>
          <Sparkline points={JOURNEY_CONSISTENCY.checkInTrend} color="var(--color-primary)" />
        </Card>
      </div>

      <p className="pt-4 text-center text-[11px] text-muted-foreground">
        Self-reported wellbeing indicator showing change over time. Historical trend data in this
        demo is synthetic.
      </p>

      {!state.baseline ? (
        <Link
          to="/onboarding/assessment"
          className="mt-4 flex h-[46px] items-center justify-center rounded-xl border border-border text-[14px] font-medium"
        >
          Complete your baseline
        </Link>
      ) : null}
    </MobileShell>
  );
}
