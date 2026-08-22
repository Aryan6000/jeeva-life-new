import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, ShieldCheck } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminCard, AdminShell } from "@/components/jeeva/admin-shell";
import { ADMIN_ASSESSMENTS, ADMIN_OVERVIEW } from "@/lib/jeeva/demo";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports — JeevaLife Admin" },
      {
        name: "description",
        content: "Export-ready aggregate programme reports: engagement, retention and wellbeing change for institutional review.",
      },
      { property: "og:title", content: "Reports — JeevaLife Admin" },
      { property: "og:description", content: "Aggregate, de-identified programme reporting and exports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminReports,
});

function AdminReports() {
  const data = ADMIN_ASSESSMENTS.map((d) => ({
    dimension: d.dimension.split(" ")[0],
    Baseline: d.baseline,
    Current: d.current,
  }));

  return (
    <AdminShell title="Reports">
      <AdminCard title="Wellbeing change by dimension">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="dimension"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
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
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Baseline" fill="var(--color-primary-soft)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Current" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AdminCard>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <AdminCard title="Programme summary">
          <dl className="text-[13px]">
            <Row label="Registered" value={String(ADMIN_OVERVIEW.registered)} />
            <Row label="Attended" value={String(ADMIN_OVERVIEW.attended)} />
            <Row label="Active participants" value={String(ADMIN_OVERVIEW.active)} />
            <Row label="Baseline completion" value={String(ADMIN_OVERVIEW.baselineComplete)} />
            <Row label="Practice frequency" value={ADMIN_OVERVIEW.engagement.practiceFrequency} />
            <Row label="Check-in frequency" value={ADMIN_OVERVIEW.engagement.checkInFrequency} />
            <Row
              label="Programme completion"
              value={ADMIN_OVERVIEW.engagement.programmeCompletion}
            />
          </dl>
        </AdminCard>

        <AdminCard title="Exports">
          <div className="space-y-2.5">
            {["Engagement report", "Retention report", "Wellbeing change report"].map((label) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-3.5 py-3"
              >
                <span className="flex items-center gap-2.5 text-[13px] font-medium">
                  <FileText className="size-4 text-primary" strokeWidth={1.8} />
                  {label}
                </span>
                <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <Download className="size-3.5" strokeWidth={1.8} />
                  CSV
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-mint p-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-mint-foreground" strokeWidth={1.9} />
            <p className="text-[12px] text-mint-foreground">
              Exports contain aggregate, de-identified data only.
            </p>
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
