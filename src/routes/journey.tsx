import { createFileRoute, Link } from "@tanstack/react-router";
import { Info, LineChart as LineChartIcon, Activity as ActivityIcon, ArrowUpRight, Flower2, CalendarCheck } from "lucide-react";
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
      <header className="flex items-center justify-between py-6">
        <h1 className="text-[28px] font-bold tracking-tight text-[#112A27]">My Journey</h1>
        <span className="flex items-center justify-center text-[#112A27]">
          <Info className="size-6" strokeWidth={1.5} />
        </span>
      </header>

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col items-center rounded-[24px] border border-[#EAE6DF]/60 bg-[#FAF7F2] p-4 shadow-sm">
          <div className="flex size-[44px] items-center justify-center rounded-full bg-[#FFF2EC] text-[#EF755C]">
            <LineChartIcon className="size-6" strokeWidth={1.5} />
          </div>
          <p className="mt-3 text-[14px] text-[#112A27] font-medium">Baseline</p>
          <p className="text-[32px] font-semibold text-[#112A27] leading-none mt-1">{baseline ?? "—"}</p>
        </div>
        <div className="flex flex-1 flex-col items-center rounded-[24px] border border-[#EAE6DF]/60 bg-[#EEF4EB]/50 p-4 shadow-sm">
          <div className="flex size-[44px] items-center justify-center rounded-full bg-[#124B43] text-white">
            <ActivityIcon className="size-6" strokeWidth={1.5} />
          </div>
          <p className="mt-3 text-[14px] text-[#112A27] font-medium">Current</p>
          <p className="text-[32px] font-semibold text-[#112A27] leading-none mt-1">{current ?? "—"}</p>
        </div>
        <div className="flex flex-1 flex-col items-center rounded-[24px] border border-[#EAE6DF]/60 bg-[#EEF4EB]/50 p-4 shadow-sm">
          <div className="flex size-[44px] items-center justify-center rounded-full bg-[#628A6B] text-white">
            <ArrowUpRight className="size-6" strokeWidth={1.5} />
          </div>
          <p className="mt-3 text-[14px] text-[#112A27] font-medium">Change</p>
          <p className="text-[32px] font-semibold text-[#628A6B] leading-none mt-1">{change === null ? "—" : `${change >= 0 ? "+" : ""}${change}`}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={cn(
              "h-11 flex-1 rounded-full border text-[14px] font-semibold transition-colors",
              range === r
                ? "border-[#124B43] bg-[#124B43] text-white"
                : "border-[#EAE6DF] bg-white text-[#60726F] hover:bg-gray-50",
            )}
          >
            {r} days
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-[24px] border border-[#EAE6DF]/50 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-[16px] font-bold text-[#112A27]">Wellbeing score trend</p>
          <span className="inline-flex items-center rounded-full bg-[#FFF2EC] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#EF755C]">
            Synthetic demo data
          </span>
        </div>
        <div className="mt-6 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
              <CartesianGrid stroke="#EAE6DF" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#60726F", fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                dy={10}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fontSize: 11, fill: "#60726F", fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid #EAE6DF",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#112A27"
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#124B43"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#124B43", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-[24px] border border-[#EAE6DF]/50 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-[32px] items-center justify-center rounded-full bg-[#EEF4EB] text-[#124B43]">
              <Flower2 className="size-[18px]" strokeWidth={1.8} />
            </span>
            <p className="text-[13px] font-medium text-[#112A27] leading-tight">Practice<br/>consistency</p>
          </div>
          <p className="mt-2 text-[26px] font-bold text-[#112A27]">{JOURNEY_CONSISTENCY.practice}%</p>
          <div className="mt-2">
            <Sparkline points={JOURNEY_CONSISTENCY.practiceTrend} color="#628A6B" />
          </div>
        </div>
        <div className="rounded-[24px] border border-[#EAE6DF]/50 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-[32px] items-center justify-center rounded-full bg-[#EEF4EB] text-[#124B43]">
              <CalendarCheck className="size-[18px]" strokeWidth={1.8} />
            </span>
            <p className="text-[13px] font-medium text-[#112A27] leading-tight">Check-in<br/>consistency</p>
          </div>
          <p className="mt-2 text-[26px] font-bold text-[#112A27]">{JOURNEY_CONSISTENCY.checkIn}%</p>
          <div className="mt-2">
            <Sparkline points={JOURNEY_CONSISTENCY.checkInTrend} color="#124B43" />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-[20px] bg-[#EEF4EB] p-4 border border-[#124B43]/10">
        <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[#124B43] text-white">
          <Info className="size-[14px]" strokeWidth={2} />
        </span>
        <p className="text-[13px] text-[#112A27] font-medium leading-snug">
          Self-reported wellbeing indicator showing change over time. Historical trend data in this demo is synthetic.
        </p>
      </div>

      {!state.baseline ? (
        <Link
          to="/onboarding/assessment"
          className="mt-6 flex h-[52px] items-center justify-center rounded-[16px] border border-[#EAE6DF] bg-white text-[15px] font-semibold text-[#112A27] shadow-sm"
        >
          Complete your baseline
        </Link>
      ) : null}
    </MobileShell>
  );
}
