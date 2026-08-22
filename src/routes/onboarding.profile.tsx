import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, GraduationCap, Sparkles, User, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AppBar, MobileShell, PrimaryButton } from "@/components/jeeva/shell";
import { useJeeva } from "@/lib/jeeva/store";
import type { Profile } from "@/lib/jeeva/types";

export const Route = createFileRoute("/onboarding/profile")({
  head: () => ({
    meta: [
      { title: "Basic profile — JeevaLife" },
      {
        name: "description",
        content: "Tell JeevaLife your name, age group, role and wellbeing goal so your programme experience fits you.",
      },
      { property: "og:title", content: "Basic profile — JeevaLife" },
      { property: "og:description", content: "Set up your JeevaLife profile in under a minute." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BasicProfile,
});

const AGE_GROUPS = ["18 - 25", "26 - 35", "36 - 50", "51 - 65", "65+"];
const ROLES = ["Student", "Faculty", "Staff", "Public"];
const GOALS = [
  "Reduce stress and improve focus",
  "Sleep better",
  "Build a steady daily practice",
  "Improve emotional balance",
];

function BasicProfile() {
  const navigate = useNavigate();
  const { state, hydrated, saveProfile } = useJeeva();
  const [form, setForm] = useState<Profile>({
    name: "",
    ageGroup: "18 - 25",
    role: "Student",
    department: "",
    wellbeingGoal: "Reduce stress and improve focus",
    gender: "",
  });

  useEffect(() => {
    if (state.profile) setForm(state.profile);
  }, [state.profile]);

  const valid = form.name.trim().length >= 2 && form.role.length > 0;

  const submit = () => {
    if (!valid) return;
    saveProfile({ ...form, name: form.name.trim() });
    navigate({ to: "/onboarding/assessment" });
  };

  return (
    <MobileShell bottomNav={false}>
      <AppBar title="Basic profile" />

      <p className="pb-4 text-[12px] text-muted-foreground">
        Saved automatically as you type. Only your name and role are required.
      </p>

      <div className="space-y-3">
        <FieldShell icon={<User className="size-4" strokeWidth={1.8} />} label="Name">
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Your full name"
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
          />
        </FieldShell>

        <FieldShell icon={<Users className="size-4" strokeWidth={1.8} />} label="Age group">
          <select
            value={form.ageGroup}
            onChange={(e) => setForm((f) => ({ ...f, ageGroup: e.target.value }))}
            className="w-full bg-transparent text-[14px] outline-none"
          >
            {AGE_GROUPS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </FieldShell>

        <FieldShell icon={<GraduationCap className="size-4" strokeWidth={1.8} />} label="Role">
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            className="w-full bg-transparent text-[14px] outline-none"
          >
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </FieldShell>

        <FieldShell icon={<Building2 className="size-4" strokeWidth={1.8} />} label="Department">
          <input
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            placeholder="School of Humanities and Social Sciences"
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
          />
        </FieldShell>

        <FieldShell icon={<Sparkles className="size-4" strokeWidth={1.8} />} label="Wellbeing goal">
          <select
            value={form.wellbeingGoal}
            onChange={(e) => setForm((f) => ({ ...f, wellbeingGoal: e.target.value }))}
            className="w-full bg-transparent text-[14px] outline-none"
          >
            {GOALS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </FieldShell>
      </div>

      <div className="pt-6">
        <PrimaryButton onClick={submit} disabled={!valid || !hydrated}>
          Continue
        </PrimaryButton>
      </div>
    </MobileShell>
  );
}

function FieldShell({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
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
