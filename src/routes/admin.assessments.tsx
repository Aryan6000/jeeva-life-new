import { createFileRoute } from "@tanstack/react-router";
import { AdminCard, AdminShell } from "@/components/jeeva/admin-shell";
import { ADMIN_ASSESSMENTS, ADMIN_OVERVIEW } from "@/lib/jeeva/demo";

export const Route = createFileRoute("/admin/assessments")({
  head: () => ({
    meta: [
      { title: "Assessments — JeevaLife Admin" },
      {
        name: "description",
        content: "Aggregate baseline versus current wellbeing dimensions across programme participants.",
      },
      { property: "og:title", content: "Assessments — JeevaLife Admin" },
      { property: "og:description", content: "Dimension-level aggregate wellbeing change for the cohort." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminAssessments,
});

function AdminAssessments() {
  return (
    <AdminShell title="Assessments">
      <div className="grid gap-3 sm:grid-cols-3">
        <AdminCard>
          <p className="text-[12px] text-muted-foreground">Baseline completion</p>
          <p className="text-[24px] font-semibold leading-tight">
            {ADMIN_OVERVIEW.baselineComplete}
          </p>
        </AdminCard>
        <AdminCard>
          <p className="text-[12px] text-muted-foreground">Average baseline</p>
          <p className="text-[24px] font-semibold leading-tight">
            {ADMIN_OVERVIEW.wellbeing.baseline}
          </p>
        </AdminCard>
        <AdminCard>
          <p className="text-[12px] text-muted-foreground">Average current</p>
          <p className="text-[24px] font-semibold leading-tight">
            {ADMIN_OVERVIEW.wellbeing.current}
          </p>
        </AdminCard>
      </div>

      <AdminCard className="mt-4" title="Dimension breakdown (baseline vs current)">
        <div className="space-y-4">
          {ADMIN_ASSESSMENTS.map((d) => (
            <div key={d.dimension}>
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium">{d.dimension}</span>
                <span className="text-muted-foreground">
                  {d.baseline} → <span className="font-semibold text-foreground">{d.current}</span>
                </span>
              </div>
              <div className="mt-2 space-y-1.5">
                <Bar value={d.baseline} className="bg-primary-soft" inner="bg-muted-foreground/40" />
                <Bar value={d.current} className="bg-primary-soft" inner="bg-primary" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-muted-foreground/40" /> Baseline
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary" /> Current
          </span>
        </div>
      </AdminCard>
    </AdminShell>
  );
}

function Bar({
  value,
  className,
  inner,
}: {
  value: number;
  className: string;
  inner: string;
}) {
  return (
    <span className={`block h-2 rounded-full ${className}`}>
      <span className={`block h-2 rounded-full ${inner}`} style={{ width: `${value}%` }} />
    </span>
  );
}
