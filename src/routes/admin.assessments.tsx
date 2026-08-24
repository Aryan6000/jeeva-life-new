import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminCard, AdminShell } from "@/components/jeeva/admin-shell";
import {
  fetchAssessmentAggregates,
  fetchOverviewStats,
  type AssessmentAggregate,
  type OverviewStats,
} from "@/lib/jeeva/adminFirestore";

const PROGRAMME_ID = "cche-2026";

export const Route = createFileRoute("/admin/assessments")({
  head: () => ({
    meta: [
      { title: "Assessments — JeevaLife Admin" },
      { name: "description", content: "Aggregate baseline versus current wellbeing dimensions across programme participants." },
      { property: "og:title", content: "Assessments — JeevaLife Admin" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AdminAssessments,
});

function AdminAssessments() {
  const [aggregates, setAggregates] = useState<AssessmentAggregate[]>([]);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([fetchAssessmentAggregates(), fetchOverviewStats(PROGRAMME_ID)])
      .then(([agg, ov]) => { setAggregates(agg); setOverview(ov); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminShell title="Assessments">
        <div className="grid gap-3 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-[88px] animate-pulse rounded-2xl bg-muted" />)}
        </div>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell title="Assessments">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-[13px] text-red-700">
          Failed to load assessment data. Please refresh.
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Assessments">
      <div className="grid gap-3 sm:grid-cols-3">
        <AdminCard>
          <p className="text-[12px] text-muted-foreground">Baseline completions</p>
          <p className="text-[24px] font-semibold leading-tight">{overview?.baselineComplete ?? 0}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-[12px] text-muted-foreground">Average baseline score</p>
          <p className="text-[24px] font-semibold leading-tight">{overview?.wellbeing.baseline ?? "—"}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-[12px] text-muted-foreground">Average current score</p>
          <p className="text-[24px] font-semibold leading-tight">{overview?.wellbeing.current ?? "—"}</p>
        </AdminCard>
      </div>

      <AdminCard className="mt-4" title="Dimension breakdown (aggregate average)">
        {aggregates.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted-foreground">
            No assessment data yet.
          </p>
        ) : (
          <div className="space-y-4">
            {aggregates.map((d) => (
              <div key={d.dimension}>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-medium">{d.dimension}</span>
                  <span className="text-muted-foreground">
                    {d.baseline} →{" "}
                    <span className="font-semibold text-foreground">{d.current}</span>
                  </span>
                </div>
                <div className="mt-2 space-y-1.5">
                  <Bar value={d.baseline} inner="bg-muted-foreground/40" />
                  <Bar value={d.current} inner="bg-primary" />
                </div>
              </div>
            ))}
          </div>
        )}
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

function Bar({ value, inner }: { value: number; inner: string }) {
  return (
    <span className="block h-2 rounded-full bg-primary-soft">
      <span className={`block h-2 rounded-full ${inner}`} style={{ width: `${value}%` }} />
    </span>
  );
}
