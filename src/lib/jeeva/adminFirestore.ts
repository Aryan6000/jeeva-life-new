/**
 * Admin Firestore queries — used by the participant-app /admin/* routes.
 * All data is aggregate and de-identified.
 */
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  getCountFromServer,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ── Types ─────────────────────────────────────────────────────────────────────

export type OverviewStats = {
  registered: number;
  attended: number;
  active: number;
  baselineComplete: number;
  retention: { range: string; value: number }[];
  wellbeing: { baseline: number; current: number };
  engagement: {
    practiceFrequency: string;
    checkInFrequency: string;
    programmeCompletion: string;
  };
};

export type ParticipantRow = {
  participantId: string;
  name: string;
  role: string;
  department: string;
  cohort: string;
  attendance: "Present" | "Absent";
  engagement: "Active" | "Occasional" | "Dormant";
};

export type SessionRow = {
  id: string;
  title: string;
  date: string;
  present: number;
  registered: number;
};

export type AssessmentAggregate = {
  dimension: string;
  baseline: number;
  current: number;
};

function tsToISO(ts: unknown): string {
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === "string") return ts;
  return new Date().toISOString();
}

// ── Overview ──────────────────────────────────────────────────────────────────

export async function fetchOverviewStats(programmeId: string): Promise<OverviewStats> {
  // Participants who joined
  const joinedSnap = await getDocs(
    query(
      collectionGroup(db, "participations"),
      where("programmeId", "==", programmeId),
      where("status", "==", "joined"),
    ),
  );
  const registered = joinedSnap.size;

  // Attendance (unique users present at any session)
  const attendanceSnap = await getDocs(
    query(
      collection(db, "attendance"),
      where("programmeId", "==", programmeId),
      where("present", "==", true),
    ),
  );
  const attended = new Set(
    attendanceSnap.docs.map((d) => (d.data() as DocumentData)["uid"] as string),
  ).size;

  // Total baseline completions
  const assessmentsCount = await getCountFromServer(collection(db, "assessments"));
  const baselineComplete = assessmentsCount.data().count;

  // Active in last 30 days
  const cutoff30 = new Date();
  cutoff30.setDate(cutoff30.getDate() - 30);
  const activeSnap = await getDocs(
    query(
      collectionGroup(db, "checkIns"),
      where("createdAt", ">=", Timestamp.fromDate(cutoff30)),
    ),
  );
  const active = new Set(
    activeSnap.docs.map((d) => d.ref.parent.parent?.id),
  ).size;

  // Average baseline score
  const assessmentDocs = await getDocs(collection(db, "assessments"));
  let baselineSum = 0;
  let scoreCount = 0;
  assessmentDocs.docs.forEach((d) => {
    const s = (d.data() as DocumentData)["score"];
    if (typeof s === "number") { baselineSum += s; scoreCount++; }
  });
  const avgBaseline = scoreCount > 0 ? Math.round(baselineSum / scoreCount) : 0;

  // Average current score from recent check-ins
  let currentSum = 0;
  let currentCount = 0;
  activeSnap.docs.forEach((d) => {
    const data = d.data() as DocumentData;
    const { stress, energy, focus, mood } = data as Record<string, unknown>;
    if (typeof stress === "number" && typeof energy === "number" &&
        typeof focus === "number" && typeof mood === "number") {
      currentSum += Math.round(((6 - stress) + energy + focus + mood) / 4 * 20);
      currentCount++;
    }
  });
  const avgCurrent = currentCount > 0 ? Math.round(currentSum / currentCount) : avgBaseline;

  // Retention windows
  const windows = [7, 30, 60, 90];
  const retention = await Promise.all(
    windows.map(async (days) => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const snap = await getDocs(
        query(collectionGroup(db, "checkIns"), where("createdAt", ">=", Timestamp.fromDate(cutoff))),
      );
      const unique = new Set(snap.docs.map((d) => d.ref.parent.parent?.id)).size;
      return { range: `${days} days`, value: registered > 0 ? Math.round((unique / registered) * 100) : 0 };
    }),
  );

  return {
    registered,
    attended,
    active,
    baselineComplete,
    retention,
    wellbeing: { baseline: avgBaseline, current: avgCurrent },
    engagement: {
      practiceFrequency: "—",
      checkInFrequency: "—",
      programmeCompletion: registered > 0 ? `${Math.round((attended / registered) * 100)}%` : "—",
    },
  };
}

// ── Participants ──────────────────────────────────────────────────────────────

export async function fetchParticipants(
  programmeId: string,
  limitCount = 200,
): Promise<ParticipantRow[]> {
  const joinedSnap = await getDocs(
    query(
      collectionGroup(db, "participations"),
      where("programmeId", "==", programmeId),
      where("status", "==", "joined"),
      limit(limitCount),
    ),
  );

  const rows: ParticipantRow[] = [];
  let index = 1000;

  for (const pDoc of joinedSnap.docs) {
    const uid = pDoc.ref.parent.parent?.id;
    if (!uid) continue;

    const userSnap = await getDoc(doc(db, "users", uid));
    if (!userSnap.exists()) continue;
    const userData = userSnap.data() as DocumentData;
    const profile = (userData["profile"] as Record<string, string>) ?? {};

    // Engagement: check-ins in last 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const ciSnap = await getDocs(
      query(
        collection(db, "users", uid, "checkIns"),
        where("createdAt", ">=", Timestamp.fromDate(cutoff)),
        limit(5),
      ),
    );
    const ciCount = ciSnap.size;
    const engagement: ParticipantRow["engagement"] =
      ciCount >= 4 ? "Active" : ciCount >= 1 ? "Occasional" : "Dormant";

    // Attendance
    const attSnap = await getDocs(
      query(
        collection(db, "attendance"),
        where("uid", "==", uid),
        where("programmeId", "==", programmeId),
        where("present", "==", true),
        limit(1),
      ),
    );
    const attendance: ParticipantRow["attendance"] = attSnap.size > 0 ? "Present" : "Absent";

    index++;
    rows.push({
      participantId: `P-${index}`,
      name: profile["name"] ?? "—",
      role: profile["role"] ?? "—",
      department: profile["department"] ?? "—",
      cohort: "University-wide",
      attendance,
      engagement,
    });
  }

  return rows;
}

// ── Sessions / Attendance ─────────────────────────────────────────────────────

export async function fetchSessions(programmeId: string): Promise<SessionRow[]> {
  const snap = await getDocs(
    query(
      collection(db, "sessions"),
      where("programmeId", "==", programmeId),
      orderBy("date", "asc"),
    ),
  );
  return snap.docs.map((d) => {
    const data = d.data() as DocumentData;
    return {
      id: d.id,
      title: (data["title"] as string) ?? "",
      date: tsToISO(data["date"]),
      present: (data["present"] as number) ?? 0,
      registered: (data["registered"] as number) ?? 0,
    };
  });
}

// ── Assessment aggregates ─────────────────────────────────────────────────────

export async function fetchAssessmentAggregates(): Promise<AssessmentAggregate[]> {
  const snap = await getDocs(collection(db, "assessments"));

  const dims = ["stress", "focus", "energy", "sleep", "emotional"] as const;
  const labels: Record<string, string> = {
    stress: "Stress balance",
    focus: "Focus",
    energy: "Energy",
    sleep: "Sleep",
    emotional: "Emotional wellbeing",
  };

  const sums: Record<string, { total: number; count: number }> = {};
  dims.forEach((d) => { sums[d] = { total: 0, count: 0 }; });

  snap.docs.forEach((docSnap) => {
    const dimensions = (docSnap.data() as DocumentData)["dimensions"] as Record<string, number> | undefined;
    if (!dimensions) return;
    dims.forEach((dim) => {
      const v = dimensions[dim];
      if (typeof v === "number") {
        sums[dim]!.total += v;
        sums[dim]!.count++;
      }
    });
  });

  return dims.map((d) => {
    const { total, count } = sums[d]!;
    const avg = count > 0 ? Math.round(total / count) : 0;
    return { dimension: labels[d] ?? d, baseline: avg, current: avg };
  });
}
