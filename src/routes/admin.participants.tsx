import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminCard, AdminShell } from "@/components/jeeva/admin-shell";
import { fetchParticipants, type ParticipantRow } from "@/lib/jeeva/adminFirestore";
import { cn } from "@/lib/utils";

const PROGRAMME_ID = "cche-2026";
const FILTERS = ["All", "Student", "Faculty", "Staff"] as const;

export const Route = createFileRoute("/admin/participants")({
  head: () => ({
    meta: [
      { title: "Participants — JeevaLife Admin" },
      { name: "description", content: "Search the programme roster and review attendance and engagement status per participant." },
      { property: "og:title", content: "Participants — JeevaLife Admin" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AdminParticipants,
});

function AdminParticipants() {
  const [data, setData] = useState<ParticipantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  useEffect(() => {
    fetchParticipants(PROGRAMME_ID)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(
    () =>
      data.filter(
        (p) =>
          (filter === "All" || p.role === filter) &&
          (p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.participantId.toLowerCase().includes(query.toLowerCase())),
      ),
    [data, query, filter],
  );

  return (
    <AdminShell title="Participants">
      <AdminCard>
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.8} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or participant ID"
              aria-label="Search participants"
              className="jl-field h-10 w-full pl-9"
            />
          </label>
          <div className="flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "h-10 rounded-lg border px-3 text-[12px] font-medium transition-colors",
                  filter === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : error ? (
          <p className="mt-6 py-8 text-center text-[13px] text-red-600">
            Failed to load participants. Please refresh.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2.5 font-medium">Participant ID</th>
                  <th className="py-2.5 font-medium">Name</th>
                  <th className="py-2.5 font-medium">Role</th>
                  <th className="py-2.5 font-medium">Cohort</th>
                  <th className="py-2.5 font-medium">Attendance</th>
                  <th className="py-2.5 font-medium">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.participantId} className="border-b border-border text-[13px] last:border-b-0">
                    <td className="py-3 text-muted-foreground">{p.participantId}</td>
                    <td className="py-3 font-medium">{p.name}</td>
                    <td className="py-3 text-muted-foreground">{p.role}</td>
                    <td className="py-3 text-muted-foreground">{p.cohort}</td>
                    <td className="py-3">
                      <Tag label={p.attendance} tone={p.attendance === "Present" ? "mint" : "peach"} />
                    </td>
                    <td className="py-3">
                      <Tag
                        label={p.engagement}
                        tone={p.engagement === "Active" ? "primary" : p.engagement === "Occasional" ? "peach" : "muted"}
                      />
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[13px] text-muted-foreground">
                      {data.length === 0 ? "No participants have joined this programme yet." : "No participants match this search."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </AdminShell>
  );
}

function Tag({ label, tone }: { label: string; tone: "mint" | "peach" | "primary" | "muted" }) {
  const tones = {
    mint: "bg-mint text-mint-foreground",
    peach: "bg-peach text-peach-foreground",
    primary: "bg-primary-soft text-primary",
    muted: "bg-muted text-muted-foreground",
  } as const;
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>{label}</span>;
}
