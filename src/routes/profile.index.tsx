import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, LogOut, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Card, MobileShell } from "@/components/jeeva/shell";
import { useJeeva } from "@/lib/jeeva/store";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

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
      <header className="py-6">
        <h1 className="text-[28px] font-bold tracking-tight text-[#112A27]">Profile</h1>
      </header>

      <div className="rounded-[24px] border border-[#EAE6DF]/60 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="flex size-[56px] items-center justify-center rounded-full bg-[#124B43] text-[22px] font-medium text-white">
            {(profile?.name ?? "J").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-[17px] font-bold text-[#112A27] leading-tight">{profile?.name ?? "Guest participant"}</p>
            <p className="text-[14px] text-[#60726F] mt-0.5">
              {profile ? `${profile.role} · ${profile.ageGroup}` : "Profile not completed"}
            </p>
          </div>
        </div>
        {profile?.department ? (
          <p className="mt-4 text-[14px] text-[#60726F] font-medium">{profile.department}</p>
        ) : null}
        <Link
          to="/onboarding/profile"
          className="mt-5 flex h-[52px] items-center justify-between rounded-[16px] bg-[#FAF7F2] border border-[#EAE6DF]/60 px-4 text-[15px] font-semibold text-[#112A27] transition-colors hover:bg-gray-50"
        >
          Edit basic profile
          <ChevronRight className="size-5 text-[#112A27]" strokeWidth={2} />
        </Link>
      </div>

      <div className="mt-4 rounded-[24px] border border-[#EAE6DF]/60 bg-[#EEF4EB] p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex size-[22px] items-center justify-center rounded-full border border-[#124B43] text-[#124B43]">
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
          </span>
          <p className="text-[16px] font-bold text-[#112A27]">Wellbeing</p>
        </div>
        <Link
          to="/profile/wellbeing"
          className="flex h-[52px] items-center justify-between rounded-[16px] border border-[#EAE6DF] bg-white px-4 text-[15px] font-medium text-[#112A27] transition-colors hover:bg-gray-50"
        >
          Baseline result
          <span className="flex items-center gap-2 text-[#60726F]">
            {state.baseline ? `${state.baseline.score}/100` : "Not completed"}
            <ChevronRight className="size-5 text-[#112A27]" strokeWidth={2} />
          </span>
        </Link>
      </div>

      <div className="mt-4 rounded-[24px] border border-[#EAE6DF]/60 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex size-[28px] items-center justify-center rounded-full bg-[#FFF2EC] text-[#EF755C]">
            <ShieldCheck className="size-[16px]" strokeWidth={2} />
          </span>
          <p className="text-[16px] font-bold text-[#112A27]">Consent</p>
        </div>
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
        <div className="mt-4 flex items-start gap-3 rounded-[16px] bg-[#EEF4EB] p-4 border border-[#124B43]/10">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#124B43]" strokeWidth={1.5} />
          <p className="text-[13px] text-[#124B43] font-medium leading-snug">
            Reports show aggregated, de-identified data. No personal data is visible to institutions.
          </p>
        </div>
      </div>

      <div className="mt-4 pb-8 space-y-3">
        <button
          type="button"
          onClick={() => {
            reset();
            toast.success("Demo data reset");
          }}
          className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[16px] bg-[#124B43] text-[15px] font-semibold text-white transition-colors hover:bg-[#0E3E37]"
        >
          <RotateCcw className="size-5" strokeWidth={2} />
          Reset demo data
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[16px] border border-[#112A27] bg-white text-[15px] font-semibold text-[#112A27] transition-colors hover:bg-gray-50"
        >
          <LogOut className="size-5" strokeWidth={2} />
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
    <div className="flex items-start justify-between gap-4 border-b border-[#EAE6DF]/60 py-4 last:border-b-0">
      <div className="min-w-0 pr-4">
        <p className="text-[15px] font-bold text-[#112A27]">{label}</p>
        <p className="mt-1 text-[13px] text-[#60726F] font-medium leading-snug">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} className={cn("mt-1", checked ? "!bg-[#EF755C]" : "")} />
    </div>
  );
}
