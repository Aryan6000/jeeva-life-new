import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck } from "lucide-react";
import { AdminCard, AdminShell } from "@/components/jeeva/admin-shell";
import { ADMIN_SESSIONS } from "@/lib/jeeva/demo";

export const Route = createFileRoute("/admin/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — JeevaLife Admin" },
      {
        name: "description",
        content: "Session-by-session attendance for the Tezpur University programme, with present counts and rates.",
      },
      { property: "og:title", content: "Attendance — JeevaLife Admin" },
      { property: "og:description", content: "Session attendance counts and rates across programme days." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminAttendance,
});

function AdminAttendance() {
  const total = ADMIN_SESSIONS.reduce((sum, s) => sum + s.present, 0);
  const avgRate = Math.round(
    (ADMIN_SESSIONS.reduce((sum, s) => sum + s.present / s.registered, 0) /
      ADMIN_SESSIONS.length) *
      100,
  );

  return (
    <AdminShell title="Attendance">
      <div className="grid gap-3 sm:grid-cols-3">
        <AdminCard>
          <p className="text-[12px] text-muted-foreground">Sessions</p>
          <p className="text-[24px] font-semibold leading-tight">{ADMIN_SESSIONS.length}</p>
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
        <div className="space-y-3">
          {ADMIN_SESSIONS.map((s) => {
            const rate = Math.round((s.present / s.registered) * 100);
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
                    <span className="text-[15px] font-semibold text-foreground">{s.present}</span> /{" "}
                    {s.registered} present
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
      </AdminCard>
    </AdminShell>
  );
}
