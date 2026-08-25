import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Building2, ChevronRight, GraduationCap, LogOut,
  Pencil, ShieldCheck, Sparkles, User, Users, X, Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, MobileShell } from "@/components/jeeva/shell";
import { useJeeva } from "@/lib/jeeva/store";
import { useAuth } from "@/lib/jeeva/auth";
import { Switch } from "@/components/ui/switch";
import type { Profile } from "@/lib/jeeva/types";

export const Route = createFileRoute("/profile/")({
  head: () => ({
    meta: [
      { title: "Profile — JeevaLife" },
      { name: "description", content: "Manage your JeevaLife profile details and consent." },
      { property: "og:title", content: "Profile — JeevaLife" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ProfileScreen,
});

const AGE_GROUPS = ["18 - 25", "26 - 35", "36 - 50", "51 - 65", "65+"];
const ROLES = ["Student", "Faculty", "Staff", "Public"];
const GOALS = [
  "Reduce stress and improve focus",
  "Sleep better",
  "Build a steady daily practice",
  "Improve emotional balance",
];

function ProfileScreen() {
  const { state, setConsent, saveProfile } = useJeeva();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const profile = state.profile;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Profile>({
    name: "", ageGroup: "18 - 25", role: "Student",
    department: "", wellbeingGoal: "Reduce stress and improve focus", gender: "",
  });
  const [saving, setSaving] = useState(false);

  // Populate form when profile loads
  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const valid = form.name.trim().length >= 2;

  const handleSave = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      await saveProfile({ ...form, name: form.name.trim() });
      toast.success("Profile updated");
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileShell>
      <header className="py-4">
        <h1 className="text-[20px] font-semibold tracking-tight">Profile</h1>
      </header>

      {/* ── Profile Card ─────────────────────────────────────────────── */}
      <Card>
        {!editing ? (
          /* View mode */
          <>
            <div className="flex items-center gap-3">
              <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-[22px] font-semibold text-primary">
                {(profile?.name ?? "?").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-semibold">
                  {profile?.name ?? "—"}
                </p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {profile?.role ?? "—"} · {profile?.ageGroup ?? "—"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted"
                aria-label="Edit profile"
              >
                <Pencil className="size-4" strokeWidth={1.8} />
              </button>
            </div>

            {/* Detail rows */}
            <div className="mt-4 space-y-2.5">
              <DetailRow icon={<Building2 className="size-3.5" strokeWidth={1.8} />} label="Department" value={profile?.department || "—"} />
              <DetailRow icon={<Sparkles className="size-3.5" strokeWidth={1.8} />} label="Wellbeing goal" value={profile?.wellbeingGoal || "—"} />
            </div>
          </>
        ) : (
          /* Edit mode — inline form */
          <>
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-semibold">Edit profile</p>
              <button type="button" onClick={() => { setEditing(false); if (profile) setForm(profile); }}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                aria-label="Cancel">
                <X className="size-4" strokeWidth={1.8} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <Field icon={<User className="size-4" strokeWidth={1.8} />} label="Name">
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
                />
              </Field>

              <Field icon={<Users className="size-4" strokeWidth={1.8} />} label="Age group">
                <select value={form.ageGroup} onChange={(e) => setForm((f) => ({ ...f, ageGroup: e.target.value }))}
                  className="w-full bg-transparent text-[14px] outline-none">
                  {AGE_GROUPS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </Field>

              <Field icon={<GraduationCap className="size-4" strokeWidth={1.8} />} label="Role">
                <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full bg-transparent text-[14px] outline-none">
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </Field>

              <Field icon={<Building2 className="size-4" strokeWidth={1.8} />} label="Department">
                <input
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  placeholder="e.g. Computer Science"
                  className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
                />
              </Field>

              <Field icon={<Sparkles className="size-4" strokeWidth={1.8} />} label="Wellbeing goal">
                <select value={form.wellbeingGoal} onChange={(e) => setForm((f) => ({ ...f, wellbeingGoal: e.target.value }))}
                  className="w-full bg-transparent text-[14px] outline-none">
                  {GOALS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </Field>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={!valid || saving}
              className="mt-4 flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-[14px] font-semibold text-primary-foreground transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : (
                <><Check className="size-4" strokeWidth={2} /> Save changes</>
              )}
            </button>
          </>
        )}
      </Card>

      {/* ── Wellbeing ─────────────────────────────────────────────────── */}
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

      {/* ── Consent ───────────────────────────────────────────────────── */}
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
            Reports show aggregated, de-identified data. No personal data is visible to institutions.
          </p>
        </div>
      </Card>

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <div className="mt-4 pb-4">
        <button
          type="button"
          onClick={async () => {
            await signOut();
            navigate({ to: "/" });
          }}
          className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-border text-[14px] font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          <LogOut className="size-4" strokeWidth={1.8} />
          Sign out
        </button>
      </div>
    </MobileShell>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border px-3.5 py-2.5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="ml-auto text-[13px] font-medium">{value}</span>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="jl-field flex items-start gap-3 p-3.5">
      <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium text-muted-foreground">{label}</span>
        {children}
      </span>
    </label>
  );
}

function ConsentRow({ label, hint, checked, onChange }: {
  label: string; hint: string; checked: boolean; onChange: (v: boolean) => void;
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
