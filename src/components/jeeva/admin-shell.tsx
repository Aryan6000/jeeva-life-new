import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarCheck,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

const ADMIN_NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/participants", label: "Participants", icon: Users },
  { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/admin/assessments", label: "Assessments", icon: ClipboardList },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
] as const;

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col lg:flex-row">
        <aside className="border-b border-border bg-background px-4 py-3 lg:min-h-screen lg:w-[230px] lg:shrink-0 lg:border-b-0 lg:border-r lg:px-4 lg:py-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-[15px] font-semibold text-primary">
              J
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold tracking-tight">JeevaLife</span>
              <span className="block text-[11px] text-muted-foreground">Programme Admin</span>
            </span>
          </Link>

          <nav className="mt-3 flex gap-1.5 overflow-x-auto lg:mt-6 lg:flex-col lg:overflow-visible">
            {ADMIN_NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/admin" }}
                activeProps={{ "data-status": "active" }}
                className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
              >
                <Icon className="size-4" strokeWidth={1.8} />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 lg:px-7 lg:py-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-[20px] font-semibold tracking-tight">{title}</h1>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-medium">
                <Users className="size-3.5 text-muted-foreground" strokeWidth={1.8} />
                Admin
                <ChevronDown className="size-3.5 text-muted-foreground" strokeWidth={1.8} />
              </span>
            </div>
          </header>

          <div className="mt-4 flex flex-wrap gap-3">
            <ContextSelect label="Collective Consciousness for Human Excellence 2026" />
            <ContextSelect label="Tezpur University" />
          </div>

          <div className="mt-5">{children}</div>

          <p className="pt-6 text-[11px] text-muted-foreground">
            All reports show aggregated, de-identified data.
          </p>
        </main>
      </div>
    </div>
  );
}

function ContextSelect({ label }: { label: string }) {
  return (
    <span className="flex max-w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-[12px]">
      <span className="truncate">{label}</span>
      <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.8} />
    </span>
  );
}

export function AdminCard({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-border bg-background p-4 ${className ?? ""}`}
    >
      {title ? <h2 className="pb-3 text-[13px] font-semibold">{title}</h2> : null}
      {children}
    </section>
  );
}
