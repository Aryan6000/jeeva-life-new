import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, LogOut, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Card, MobileShell } from "@/components/jeeva/shell";
import { useJeeva } from "@/lib/jeeva/store";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/profile/")({
  head: () => ({
    meta: [
      { title: "Profile and consent — JeevaLife" },
      {
        name: "description",
        content: "Manage your JeevaLife profile details, aggregate reporting consent and demo data reset.",
      },
      { property: "og:title", content: "Profile and consent — JeevaLife" },
      { property: "og:description", content: "Your details, your consent choices, always reversible." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfileScreen,
});

function ProfileScreen() {
  const { state, setConsent, reset } = useJeeva();
  const navigate = useNavigate();
  const profile = state.profile;

  return (
    <MobileShell>
      <header className="py-4">
        <h1 className="text-[20px] font-semibold tracking-tight">Profile</h1>
      </header>

      <Card>
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-[17px] font-semibold text-primary">
            {(profile?.name ?? "J").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold">{profile?.name ?? "Guest participant"}</p>
            <p className="text-[12px] text-muted-foreground">
              {profile ? `${profile.role} · ${profile.ageGroup}` : "Profile not completed"}
            </p>
          </div>
        </div>
        {profile?.department ? (
          <p className="mt-3 text-[12px] text-muted-foreground">{profile.department}</p>
        ) : null}
        <Link
          to="/onboarding/profile"
          className="mt-4 flex h-[44px] items-center justify-between rounded-xl border border-border px-3.5 text-[13px] font-medium"
        >
          Edit basic profile
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </Card>

      <Card className="mt-4">
        <p className="text-[13px] font-semibold">Wellbeing</p>
        <Link
          to="/profile/wellbeing"
          className="mt-3 flex h-[44px] items-center justify-between rounded-xl border border-border px-3.5 text-[13px]"
        >
          Baseline result
          <span className="flex items-center gap-2 text-muted-foreground">
            {state.baseline ? `${state.baseline.score}/100` : "Not completed"}
            <ChevronRight className="size-4" />
          </span>
        </Link>
      </Card>

      <Card className="mt-4">
        <p className="text-[13px] font-semibold">Consent</p>
        <ConsentRow
          label="Aggregate insights"
          hint="Your data contributes to de-identified programme reporting."
          checked={state.consent.aggregateInsights}
          onChange={(v) => setConsent("aggregateInsights", v)}
        />
        <ConsentRow
          label="Identifiable institutional sharing"
          hint="Off by default. Requires explicit separate consent."
          checked={state.consent.identifiableSharing}
          onChange={(v) => setConsent("identifiableSharing", v)}
        />
        <ConsentRow
          label="Research use"
          hint="Off by default. Not bundled into this release."
          checked={state.consent.research}
          onChange={(v) => setConsent("research", v)}
        />
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-mint p-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-mint-foreground" strokeWidth={1.9} />
          <p className="text-[12px] text-mint-foreground">
            Reports show aggregated, de-identified data. No personal data is visible to
            institutions.
          </p>
        </div>
      </Card>

      <div className="mt-4 space-y-2.5">
        <button
          type="button"
          onClick={() => {
            reset();
            toast.success("Demo data reset");
          }}
          className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-border text-[14px] font-medium"
        >
          <RotateCcw className="size-4" strokeWidth={1.8} />
          Reset demo data
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-border text-[14px] font-medium text-muted-foreground"
        >
          <LogOut className="size-4" strokeWidth={1.8} />
          Sign out
        </button>
      </div>
    </MobileShell>
  );
}

function ConsentRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[13px] font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
