import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, FileText, ShieldCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminCard, AdminShell } from "@/components/jeeva/admin-shell";
import {
  fetchAssessmentAggregates,
  fetchOverviewStats,
  type AssessmentAggregate,
  type OverviewStats,
} from "@/lib/jeeva/adminFirestore";

const PROGRAMME_ID = "cche-2026";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports — JeevaLife Admin" },
      { name: "description", content: "Export-ready aggregate programme reports: engagement, retention and wellbeing change." },
      { property: "og:title", content: "Reports — JeevaLife Admin" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AdminReports,
});

function AdminReports() {
  const [aggregates, setAggregates] = useState<AssessmentAggregate[]>([]);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAssessmentAggregates(), fetchOverviewStats(PROGRAMME_ID)])
      .then(([agg, ov]) => { setAggregates(agg); setOverview(ov); })
      .finally(() => setLoading(false));
  }, []);

  const chartData = aggregates.map((d) => ({
    dimension: d.dimension.split(" ")[0],
    Baseline: d.baseline,
    Current: d.current,
  }));

  const handleExport = (reportType: string) => {
    if (!overview) return;
    let csv = "";
    if (reportType === "Engagement report") {
      csv = ["Metric,Value",
        `Practice frequency,${overview.engagement.practiceFrequency}`,
        `Check-in frequency,${overview.engagement.checkInFrequency}`,
        `Programme completion,${overview.engagement.programmeCompletion}`,
        `Active participants,${overview.active}`].join("\n");
    } else if (reportType === "Retention report") {
      csv = ["Window,Retention %", ...overview.retention.map((r) => `${r.range},${r.value}`)].join("\n");
    } else {
      csv = ["Dimension,Baseline,Current", ...aggregates.map((d) => `${d.dimension},${d.baseline},${d.current}`)].join("\n");
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType.replace(/ /g, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell title="Reports">
      <AdminCard title="Wellbeing change by dimension">
        {loading ? (
          <div className="h-[300px] animate-pulse rounded-xl bg-muted" />
        ) : chartData.length === 0 ? (
          <p className="py-12 text-center text-[13px] text-muted-foreground">No assessment data yet.</p>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="dimension" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Baseline" fill="var(--color-primary-soft)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Current" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </AdminCard>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <AdminCard title="Programme summary">
          {loading ? (
            <div className="space-y-2">{[...Array(7)].map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-muted" />)}</div>
          ) : overview ? (
            <dl className="text-[13px]">
              <Row label="Registered" value={String(overview.registered)} />
              <Row label="Attended" value={String(overview.attended)} />
              <Row label="Active participants" value={String(overview.active)} />
              <Row label="Baseline completions" value={String(overview.baselineComplete)} />
              <Row label="Practice frequency" value={overview.engagement.practiceFrequency} />
              <Row label="Check-in frequency" value={overview.engagement.checkInFrequency} />
              <Row label="Programme completion" value={overview.engagement.programmeCompletion} />
            </dl>
          ) : (
            <p className="text-[13px] text-muted-foreground">No data available.</p>
          )}
        </AdminCard>

        <AdminCard title="Exports">
          <div className="space-y-2.5">
            {["Engagement report", "Retention report", "Wellbeing change report"].map((label) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-border bg-surface px-3.5 py-3">
                <span className="flex items-center gap-2.5 text-[13px] font-medium">
                  <FileText className="size-4 text-primary" strokeWidth={1.8} />
                  {label}
                </span>
                <button
                  type="button"
                  onClick={() => handleExport(label)}
                  disabled={loading || !overview}
                  className="flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                >
                  <Download className="size-3.5" strokeWidth={1.8} />
                  CSV
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-mint p-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-mint-foreground" strokeWidth={1.9} />
            <p className="text-[12px] text-mint-foreground">Exports contain aggregate, de-identified data only.</p>
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
