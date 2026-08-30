import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function RatingScale({
  value,
  onChange,
  minLabel,
  maxLabel,
}: {
  value: number | null;
  onChange: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-center gap-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`Rate ${n}`}
            aria-pressed={value === n}
            onClick={() => onChange(n)}
            className={cn(
              "jl-tap flex size-11 items-center justify-center rounded-full border text-[15px] font-medium transition-colors",
              value === n
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted",
            )}
          >
            {n}
          </button>
        ))}
      </div>
      {minLabel || maxLabel ? (
        <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      ) : null}
    </div>
  );
}

export function RatingRow({
  icon,
  label,
  value,
  onChange,
  tone = "primary",
}: {
  icon: ReactNode;
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  tone?: "primary" | "mint" | "peach";
}) {
  const toneClass =
    tone === "mint" ? "bg-[#EEF4EB] text-[#124B43]" : tone === "peach" ? "bg-[#FFF2EC] text-[#EF755C]" : "bg-[#F3F7F5] text-[#124B43]";

  return (
    <div className="flex items-center gap-4 py-4">
      <span className={cn("flex size-[42px] shrink-0 items-center justify-center rounded-full", toneClass)}>
        {icon}
      </span>
      <span className="w-14 shrink-0 text-[15px] font-medium text-[#112A27]">{label}</span>
      <div className="flex flex-1 items-center justify-between gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${label} ${n}`}
            aria-pressed={value === n}
            onClick={() => onChange(n)}
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-medium transition-colors border",
              value === n
                ? "bg-[#112A27] border-[#112A27] text-white"
                : "border-[#EAE6DF] text-[#112A27] bg-white hover:bg-gray-50",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ScoreRing({
  score,
  size = 132,
  label = "/100",
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(score, 0), 100) / 100);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary-soft)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 220ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[34px] font-semibold leading-none">{score}</span>
        <span className="text-[12px] text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

export function DimensionBar({
  icon,
  label,
  value,
  colorVar = "var(--color-primary)",
}: {
  icon?: ReactNode;
  label: string;
  value: number;
  colorVar?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      {icon ? <span className="text-muted-foreground">{icon}</span> : null}
      <span className="w-[130px] shrink-0 truncate text-[13px]">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-primary-soft">
        <div
          className="h-1.5 rounded-full"
          style={{ width: `${value}%`, backgroundColor: colorVar }}
        />
      </div>
      <span className="w-14 shrink-0 text-right text-[12px] text-muted-foreground">
        {value}/100
      </span>
    </div>
  );
}

export function Sparkline({
  points,
  color = "var(--color-mint-foreground)",
}: {
  points: number[];
  color?: string;
}) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 24 - ((p - min) / span) * 20;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-7 w-full">
      <path d={path} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function StatPill({
  label,
  value,
  tone = "surface",
}: {
  label: string;
  value: ReactNode;
  tone?: "surface" | "mint" | "primarySoft";
}) {
  const toneClass =
    tone === "mint"
      ? "bg-mint text-mint-foreground"
      : tone === "primarySoft"
        ? "bg-primary-soft text-primary-dark"
        : "bg-surface text-foreground";
  return (
    <div className={cn("flex-1 rounded-xl border border-border p-3 text-center", toneClass)}>
      <div className="text-[11px] opacity-80">{label}</div>
      <div className="text-[22px] font-semibold leading-tight">{value}</div>
    </div>
  );
}
