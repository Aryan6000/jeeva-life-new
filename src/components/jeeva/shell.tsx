import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Bell, Compass, Home, LineChart, User } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Centred 620px participant shell with sticky bottom navigation below 768px. */
export function MobileShell({
  children,
  bottomNav = true,
  className,
}: {
  children: ReactNode;
  bottomNav?: boolean;
  className?: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div
        className={cn(
          "mx-auto w-full max-w-[620px] px-4 sm:px-5",
          bottomNav ? "pb-28" : "pb-10",
          className,
        )}
      >
        {children}
      </div>
      {bottomNav ? <BottomNav /> : null}
    </div>
  );
}

const NAV = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/journey", label: "Journey", icon: LineChart },
  { to: "/programs", label: "Programs", icon: Compass },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[620px] items-center justify-between px-2 pb-2 pt-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeProps={{ "data-active": "true" }}
            className={cn(
              "group flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors",
              "data-[active=true]:text-primary",
            )}
          >
            <span className="flex size-8 items-center justify-center rounded-xl transition-colors group-data-[active=true]:bg-primary-soft">
              <Icon className="size-[18px] transition-all group-data-[active=true]:stroke-[2.4]" strokeWidth={1.7} />
            </span>
            <span className="transition-all group-data-[active=true]:font-semibold">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function AppBar({
  title,
  back = true,
  right,
}: {
  title: string;
  back?: boolean;
  right?: ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="flex items-center gap-2 py-4">
      {back ? (
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.history.back()}
          className="jl-tap -ml-2 flex items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-5" strokeWidth={1.8} />
        </button>
      ) : null}
      <h1 className="flex-1 truncate text-center text-[15px] font-semibold">{title}</h1>
      <div className="jl-tap flex items-center justify-end">{right}</div>
    </header>
  );
}

export function NotificationBell() {
  return (
    <Link
      to="/profile"
      aria-label="Notifications"
      className="jl-tap flex items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
    >
      <Bell className="size-5" strokeWidth={1.8} />
    </Link>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("jl-card p-4", className)}>{children}</div>;
}

export function PrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "h-[50px] w-full rounded-xl px-4 text-[15px] font-semibold text-white transition-opacity",
        "hover:opacity-90 active:opacity-80 disabled:opacity-45",
        className,
      )}
      style={{ backgroundColor: "var(--color-cta)", ...(props.style ?? {}) }}
    >
      {children}
    </button>
  );
}

export function StickyAction({ children }: { children: ReactNode }) {
  return <div className="pt-2">{children}</div>;
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return <p className="pt-4 text-center text-[11px] text-muted-foreground">{children}</p>;
}
