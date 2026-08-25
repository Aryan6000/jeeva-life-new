import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { AdminCard, AdminShell } from "@/components/jeeva/admin-shell";
import { fetchSessions, type SessionRow } from "@/lib/jeeva/adminFirestore";

const PROGRAMME_ID = "cche-2026";

export const Route = createFileRoute("/admin/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — JeevaLife Admin" },
      { name: "description", content: "Session-by-session attendance for the programme." },
      { property: "og:title", content: "Attendance — JeevaLife Admin" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AdminAttendance,
});

function AdminAttendance() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchSessions(PROGRAMME_ID)
      .then(setSessions)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const total = sessions.reduce((sum, s) => sum + s.present, 0);
  const avgRate =
    sessions.length > 0
      ? Math.round(
          (sessions.reduce((sum, s) => sum + s.present / Math.max(s.registered, 1), 0) /
            sessions.length) * 100,
        )
      : 0;

  if (loading) {
    return (
      <AdminShell title="Attendance">
        <div className="grid gap-3 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-[88px] animate-pulse rounded-2xl bg-muted" />)}
        </div>
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell title="Attendance">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-[13px] text-red-700">
          Failed to load attendance data. Please refresh.
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Attendance">
      <div className="grid gap-3 sm:grid-cols-3">
        <AdminCard>
          <p className="text-[12px] text-muted-foreground">Sessions</p>
          <p className="text-[24px] font-semibold leading-tight">{sessions.length}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-[12px] text-muted-foreground">Total check-ins</p>
          <p className="text-[24px] font-semibold leading-tight">{total}</p>
        </AdminCard>
        <AdminCard>
          <p className="text-[12px] text-muted-foreground">Average attendance rate</p>
          <p className="text-[24px] font-semibold leading-tight">{avgRate}%</p>
        </AdminCard>
      </div>

      <AdminCard className="mt-4" title="Sessions">
        {sessions.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted-foreground">
            No sessions recorded yet. Run the seed script to add programme sessions.
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => {
              const rate = Math.round((s.present / Math.max(s.registered, 1)) * 100);
              return (
                <div key={s.id} className="rounded-xl border border-border bg-surface p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                        <CalendarCheck className="size-4" strokeWidth={1.8} />
                      </span>
                      <div>
                        <p className="text-[13px] font-medium">{s.title}</p>
                        <p className="text-[11px] text-muted-foreground">{s.date}</p>
                      </div>
                    </div>
                    <p className="text-[12px] text-muted-foreground">
                      <span className="text-[15px] font-semibold text-foreground">{s.present}</span>{" "}
                      / {s.registered} present
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="h-2 flex-1 rounded-full bg-primary-soft">
                      <span className="block h-2 rounded-full bg-primary" style={{ width: `${rate}%` }} />
                    </span>
                    <span className="w-10 text-right text-[12px] font-medium">{rate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AdminCard>
    </AdminShell>
  );
}
