/**
 * Firestore service layer — the ONLY place that touches raw Firestore paths.
 * All components and the store must use these functions exclusively.
 *
 * Collection structure (matches PDF spec):
 *   users/{uid}
 *   users/{uid}/checkIns/{dateKey}
 *   users/{uid}/activities/{activityId}
 *   users/{uid}/participations/{programmeId}
 *   assessments/{uid}              ← one immutable baseline per user
 *   programmes/{programmeId}
 *   organisations/{orgId}
 */

import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  Profile,
  Assessment,
  CheckIn,
  Activity,
  Participation,
  JeevaState,
  Programme,
} from "./types";

// ─── helpers ────────────────────────────────────────────────────────────────

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

function tsToISO(ts: unknown): string {
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === "string") return ts;
  return new Date().toISOString();
}

// ─── User document ───────────────────────────────────────────────────────────

export type UserDoc = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  onboardingStatus: "profile_pending" | "assessment_pending" | "complete";
  role: "participant" | "admin";
  consent: JeevaState["consent"];
  createdAt: string;
  updatedAt: string;
};

/** Fetch the user document; returns null if it doesn't exist yet. */
export async function getUserDoc(uid: string): Promise<(UserDoc & { profile: Profile | null }) | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const d = snap.data() as DocumentData;
  return {
    uid: d["uid"] ?? uid,
    email: d["email"] ?? null,
    displayName: d["displayName"] ?? null,
    photoURL: d["photoURL"] ?? null,
    onboardingStatus: d["onboardingStatus"] ?? "profile_pending",
    role: d["role"] ?? "participant",
    consent: d["consent"] ?? {
      aggregateInsights: true,
      identifiableSharing: false,
      research: false,
    },
    profile: (d["profile"] as Profile) ?? null,
    createdAt: tsToISO(d["createdAt"]),
    updatedAt: tsToISO(d["updatedAt"]),
  };
}

/** Create user document on first login — idempotent. */
export async function createUserDocIfMissing(
  uid: string,
  email: string | null,
  displayName: string | null,
  photoURL: string | null,
): Promise<void> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return; // already created — do nothing

  const now = serverTimestamp();
  await setDoc(ref, {
    uid,
    email,
    displayName,
    photoURL,
    onboardingStatus: "profile_pending",
    role: "participant",
    consent: {
      aggregateInsights: true,
      identifiableSharing: false,
      research: false,
    },
    createdAt: now,
    updatedAt: now,
  });
}

/** Update the user's onboarding status. */
export async function updateOnboardingStatus(
  uid: string,
  status: UserDoc["onboardingStatus"],
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    onboardingStatus: status,
    updatedAt: serverTimestamp(),
  });
}

// ─── Profile ─────────────────────────────────────────────────────────────────

/** Save (merge) a user's profile into users/{uid}. */
export async function saveProfileDoc(uid: string, profile: Profile): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    profile: stripUndefined(profile as unknown as Record<string, unknown>),
    onboardingStatus: "assessment_pending",
    updatedAt: serverTimestamp(),
  });
}

/** Fetch the profile from the user doc. */
export async function getProfileDoc(uid: string): Promise<Profile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return (snap.data()["profile"] as Profile) ?? null;
}

// ─── Assessment (baseline) ───────────────────────────────────────────────────

/**
 * Submit an immutable baseline assessment.
 * Stored in assessments/{uid} — one document per user.
 * Silently ignored if one already exists (server-side rule enforces immutability).
 */
export async function submitBaselineDoc(uid: string, assessment: Assessment): Promise<void> {
  const ref = doc(db, "assessments", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return; // immutable — never overwrite

  await setDoc(ref, {
    uid,
    ...assessment,
    submittedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "users", uid), {
    onboardingStatus: "complete",
    updatedAt: serverTimestamp(),
  });
}

/** Fetch the baseline for a user. */
export async function getBaselineDoc(uid: string): Promise<Assessment | null> {
  const snap = await getDoc(doc(db, "assessments", uid));
  if (!snap.exists()) return null;
  const d = snap.data() as DocumentData;
  return {
    answers: d["answers"],
    dimensions: d["dimensions"],
    score: d["score"],
    submittedAt: tsToISO(d["submittedAt"]),
  };
}

// ─── Check-ins ────────────────────────────────────────────────────────────────

/** Save (upsert) a daily check-in. users/{uid}/checkIns/{dateKey} */
export async function saveCheckInDoc(uid: string, checkIn: CheckIn): Promise<void> {
  const ref = doc(db, "users", uid, "checkIns", checkIn.dateKey);
  await setDoc(
    ref,
    {
      ...checkIn,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/** Fetch today's check-in. */
export async function getCheckInDoc(uid: string, dateKey: string): Promise<CheckIn | null> {
  const snap = await getDoc(doc(db, "users", uid, "checkIns", dateKey));
  if (!snap.exists()) return null;
  const d = snap.data() as DocumentData;
  return {
    dateKey: d["dateKey"] ?? dateKey,
    stress: d["stress"],
    energy: d["energy"],
    focus: d["focus"],
    mood: d["mood"],
    createdAt: tsToISO(d["createdAt"]),
  };
}

/** Fetch the last N check-ins ordered by dateKey desc. */
export async function getRecentCheckIns(uid: string, n = 90): Promise<CheckIn[]> {
  const q = query(
    collection(db, "users", uid, "checkIns"),
    orderBy("dateKey", "desc"),
    limit(n),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as DocumentData;
    return {
      dateKey: data["dateKey"] ?? d.id,
      stress: data["stress"],
      energy: data["energy"],
      focus: data["focus"],
      mood: data["mood"],
      createdAt: tsToISO(data["createdAt"]),
    };
  });
}

// ─── Activities ───────────────────────────────────────────────────────────────

/**
 * Log a new activity. Activities are immutable after creation per spec.
 * users/{uid}/activities/{auto-id}
 */
export async function logActivityDoc(
  uid: string,
  activity: Omit<Activity, "id">,
): Promise<Activity> {
  const ref = await addDoc(collection(db, "users", uid, "activities"), {
    ...activity,
    createdAt: serverTimestamp(),
  });
  return { ...activity, id: ref.id };
}

/** Fetch recent activities ordered by createdAt desc. */
export async function getActivitiesDoc(uid: string, n = 90): Promise<Activity[]> {
  const q = query(
    collection(db, "users", uid, "activities"),
    orderBy("createdAt", "desc"),
    limit(n),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as DocumentData;
    return {
      id: d.id,
      dateKey: data["dateKey"],
      type: data["type"],
      durationMinutes: data["durationMinutes"],
      note: data["note"],
      createdAt: tsToISO(data["createdAt"]),
    } satisfies Activity;
  });
}

// ─── Participations ────────────────────────────────────────────────────────────

/** Save programme participation choice. users/{uid}/participations/{programmeId} */
export async function setParticipationDoc(
  uid: string,
  participation: Participation,
): Promise<void> {
  const ref = doc(db, "users", uid, "participations", participation.programmeId);
  await setDoc(
    ref,
    {
      ...participation,
      joinedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/** Fetch all participation records for a user. */
export async function getParticipationsDoc(
  uid: string,
): Promise<Record<string, Participation>> {
  const snap = await getDocs(collection(db, "users", uid, "participations"));
  const out: Record<string, Participation> = {};
  snap.docs.forEach((d) => {
    const data = d.data() as DocumentData;
    out[d.id] = {
      programmeId: data["programmeId"] ?? d.id,
      status: data["status"],
      joinedAt: tsToISO(data["joinedAt"]),
    };
  });
  return out;
}

// ─── Consent ──────────────────────────────────────────────────────────────────

/** Persist a single consent flag change. */
export async function updateConsentDoc(
  uid: string,
  key: keyof JeevaState["consent"],
  value: boolean,
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    [`consent.${key}`]: value,
    updatedAt: serverTimestamp(),
  });
}

// ─── Load full state ─────────────────────────────────────────────────────────

/**
 * Load all user data from Firestore in parallel.
 * Called once on app startup after auth resolves.
 */
export async function loadUserState(uid: string): Promise<JeevaState> {
  const [userDoc, baseline, checkIns, activities, participations] = await Promise.all([
    getUserDoc(uid),
    getBaselineDoc(uid),
    getRecentCheckIns(uid, 90),
    getActivitiesDoc(uid, 90),
    getParticipationsDoc(uid),
  ]);

  const checkInsMap: Record<string, CheckIn> = {};
  checkIns.forEach((c) => {
    checkInsMap[c.dateKey] = c;
  });

  return {
    profile: userDoc?.profile ?? null,
    baseline,
    checkIns: checkInsMap,
    activities,
    participations,
    consent: userDoc?.consent ?? {
      aggregateInsights: true,
      identifiableSharing: false,
      research: false,
    },
  };
}

// ─── Programmes (public read) ─────────────────────────────────────────────────

/** Fetch all programmes ordered by createdAt desc. */
export async function getProgrammes(): Promise<Programme[]> {
  const snap = await getDocs(
    query(collection(db, "programmes"), orderBy("createdAt", "desc"), limit(50)),
  );
  return snap.docs.map((d) => {
    const data = d.data() as DocumentData;
    const p: Programme = {
      id: d.id,
      name: (data["name"] as string) ?? "",
      organisation: (data["organisation"] as string) ?? "",
      dates: (data["dates"] as string) ?? "",
      venue: (data["venue"] as string) ?? "",
      active: (data["active"] as boolean) ?? false,
    };
    if (data["summary"]) p.summary = data["summary"] as string;
    if (data["startsLabel"]) p.startsLabel = data["startsLabel"] as string;
    return p;
  });
}

/** Fetch a single programme by ID. Returns null if not found. */
export async function getProgrammeById(id: string): Promise<Programme | null> {
  const snap = await getDoc(doc(db, "programmes", id));
  if (!snap.exists()) return null;
  const data = snap.data() as DocumentData;
  const p: Programme = {
    id: snap.id,
    name: (data["name"] as string) ?? "",
    organisation: (data["organisation"] as string) ?? "",
    dates: (data["dates"] as string) ?? "",
    venue: (data["venue"] as string) ?? "",
    active: (data["active"] as boolean) ?? false,
  };
  if (data["summary"]) p.summary = data["summary"] as string;
  if (data["startsLabel"]) p.startsLabel = data["startsLabel"] as string;
  return p;
}
