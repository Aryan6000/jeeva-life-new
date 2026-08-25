import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, CheckCircle2, ClipboardCheck, ShieldCheck, Users } from "lucide-react";
import { AdminCard, AdminShell } from "@/components/jeeva/admin-shell";
import { fetchOverviewStats, type OverviewStats } from "@/lib/jeeva/adminFirestore";
import type { ReactNode } from "react";

const PROGRAMME_ID = "cche-2026";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Programme overview — JeevaLife Admin" },
      { name: "description", content: "Aggregate programme metrics for registration, attendance, activity and baseline completion." },
      { property: "og:title", content: "Programme overview — JeevaLife Admin" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const [data, setData] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchOverviewStats(PROGRAMME_ID)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminShell title="Programme Overview">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[88px] animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </AdminShell>
    );
  }

  if (error || !data) {
    return (
      <AdminShell title="Programme Overview">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-[13px] text-red-700">
          Failed to load overview data. Please refresh.
        </div>
      </AdminShell>
    );
  }

  const o = data;

  return (
    <AdminShell title="Programme Overview">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<Users className="size-5" strokeWidth={1.8} />} tone="bg-primary-soft text-primary" label="Registered" value={o.registered} />
        <Metric icon={<CheckCircle2 className="size-5" strokeWidth={1.8} />} tone="bg-mint text-mint-foreground" label="Attended" value={o.attended} />
        <Metric icon={<Activity className="size-5" strokeWidth={1.8} />} tone="bg-primary-soft text-primary" label="Active" value={o.active} />
        <Metric icon={<ClipboardCheck className="size-5" strokeWidth={1.8} />} tone="bg-peach text-peach-foreground" label="Baseline Complete" value={o.baselineComplete} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        <AdminCard title="Retention">
          <div className="space-y-2.5">
            {o.retention.map((r) => (
              <div key={r.range} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-[12px] text-muted-foreground">{r.range}</span>
                <span className="h-2 flex-1 rounded-full bg-primary-soft">
                  <span className="block h-2 rounded-full bg-primary" style={{ width: `${r.value}%` }} />
                </span>
                <span className="w-10 shrink-0 text-right text-[12px] font-medium">{r.value}%</span>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard title="Wellbeing change (average score)">
          <div className="flex items-center justify-center gap-4">
            <Box label="Baseline" value={o.wellbeing.baseline} />
            <span className="text-muted-foreground">→</span>
            <Box label="Current" value={o.wellbeing.current} />
          </div>
          <p className="mt-3 rounded-full bg-mint py-1.5 text-center text-[12px] font-medium text-mint-foreground">
            {o.wellbeing.current >= o.wellbeing.baseline ? "+" : ""}
            {o.wellbeing.current - o.wellbeing.baseline} points
          </p>
        </AdminCard>

        <AdminCard title="Engagement">
          <EngRow label="Practice frequency" value={o.engagement.practiceFrequency} />
          <EngRow label="Check-in frequency" value={o.engagement.checkInFrequency} />
          <EngRow label="Programme completion" value={o.engagement.programmeCompletion} />
        </AdminCard>

        <AdminCard title="Privacy">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <ShieldCheck className="size-4.5" strokeWidth={1.9} />
            </span>
            <div>
              <p className="text-[13px] font-medium">Aggregate insights by default</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                All reports show aggregated, de-identified data. No personal data is visible.
              </p>
            </div>
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}

function Metric({ icon, label, value, tone }: { icon: ReactNode; label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4">
      <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>{icon}</span>
      <div>
        <p className="text-[12px] text-muted-foreground">{label}</p>
        <p className="text-[24px] font-semibold leading-tight">{value}</p>
      </div>
    </div>
  );
}

function Box({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-5 py-3 text-center">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-[22px] font-semibold leading-tight">{value}</p>
    </div>
  );
}

function EngRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-b-0">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="text-[12px] font-semibold text-mint-foreground">{value}</span>
    </div>
  );
}
