/**
 * JeevaProvider — application state backed by Firestore.
 *
 * On mount it waits for the Firebase auth state to resolve, then loads
 * the user's data from Firestore.  All mutations go through the Firestore
 * service layer (firestore.ts) and optimistically update local state so
 * the UI stays instant.
 *
 * localStorage is used only as a short-lived cache for the loading skeleton
 * (hydrated flag) so the UI never flashes an empty state on hard reload.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { buildAssessment, dateKey, lastNDateKeys } from "./scoring";
import type {
  Activity,
  ActivityType,
  Assessment,
  CheckIn,
  DimensionKey,
  JeevaState,
  OnboardingStatus,
  Profile,
} from "./types";
import {
  saveProfileDoc,
  submitBaselineDoc,
  saveCheckInDoc,
  logActivityDoc,
  setParticipationDoc,
  updateConsentDoc,
  loadUserState,
  createUserDocIfMissing,
} from "./firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

// ── Local storage fallback key (used only for hydration skeleton) ─────────────
const CACHE_KEY = "jeevalife.cache.v2";

const EMPTY: JeevaState = {
  profile: null,
  baseline: null,
  checkIns: {},
  activities: [],
  participations: {},
  consent: { aggregateInsights: true, identifiableSharing: false, research: false },
};

type JeevaContextValue = {
  state: JeevaState;
  /** True once the full Firestore load has completed (or auth confirmed no user). */
  hydrated: boolean;
  /** True while the initial Firestore fetch is in progress. */
  loading: boolean;
  onboardingStatus: OnboardingStatus;
  todayCheckIn: CheckIn | null;
  consistencyDays: number;
  saveProfile: (profile: Profile) => Promise<void>;
  submitBaseline: (answers: Record<DimensionKey, number>) => Promise<Assessment>;
  saveCheckIn: (input: Omit<CheckIn, "dateKey" | "createdAt">) => Promise<void>;
  logActivity: (input: { type: ActivityType; durationMinutes: number; note?: string }) => Promise<void>;
  setParticipation: (programmeId: string, status: "joined" | "declined") => Promise<void>;
  setConsent: (key: keyof JeevaState["consent"], value: boolean) => Promise<void>;
  reset: () => void;
};

const JeevaContext = createContext<JeevaContextValue | null>(null);

export function JeevaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<JeevaState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  // ── Auth listener: load Firestore data when user signs in ──────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setState(EMPTY);
        setUid(null);
        setHydrated(true);
        setLoading(false);
        // Clear cache so next login always reads fresh from Firestore
        try { window.localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
        return;
      }

      setUid(user.uid);
      setLoading(true);

      try {
        // Ensure the user document exists (idempotent — safe to call every time)
        await createUserDocIfMissing(
          user.uid,
          user.email,
          user.displayName,
          user.photoURL,
        );

        const loaded = await loadUserState(user.uid);
        setState(loaded);

        // Keep a short-lived cache so the skeleton doesn't flash on refresh
        try {
          window.localStorage.setItem(CACHE_KEY, JSON.stringify(loaded));
        } catch {
          /* storage unavailable */
        }
      } catch (err) {
        console.error("Failed to load user data from Firestore:", err);
        // Fallback to cache if Firestore is temporarily unreachable
        try {
          const raw = window.localStorage.getItem(CACHE_KEY);
          if (raw) setState({ ...EMPTY, ...(JSON.parse(raw) as JeevaState) });
        } catch {
          /* ignore corrupt cache */
        }
      } finally {
        setHydrated(true);
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const saveProfile = useCallback(
    async (profile: Profile) => {
      if (!uid) return;
      // Optimistic update
      setState((s) => ({ ...s, profile }));
      await saveProfileDoc(uid, profile);
    },
    [uid],
  );

  const submitBaseline = useCallback(
    async (answers: Record<DimensionKey, number>): Promise<Assessment> => {
      const assessment = buildAssessment(answers);
      if (!uid) return assessment;
      // Only allow one baseline per user
      if (state.baseline) return state.baseline;
      setState((s) => ({ ...s, baseline: assessment }));
      await submitBaselineDoc(uid, assessment);
      return assessment;
    },
    [uid, state.baseline],
  );

  const saveCheckIn = useCallback(
    async (input: Omit<CheckIn, "dateKey" | "createdAt">) => {
      if (!uid) return;
      const key = dateKey();
      const checkIn: CheckIn = {
        ...input,
        dateKey: key,
        createdAt: new Date().toISOString(),
      };
      // Optimistic update
      setState((s) => ({
        ...s,
        checkIns: { ...s.checkIns, [key]: checkIn },
      }));
      await saveCheckInDoc(uid, checkIn);
    },
    [uid],
  );

  const logActivity = useCallback(
    async (input: { type: ActivityType; durationMinutes: number; note?: string }) => {
      if (!uid) return;
      const partial: Omit<Activity, "id"> = {
        dateKey: dateKey(),
        createdAt: new Date().toISOString(),
        ...input,
      };
      // Optimistic update with a temporary id
      const tempId = `temp_${Date.now()}`;
      setState((s) => ({
        ...s,
        activities: [{ ...partial, id: tempId }, ...s.activities],
      }));
      // Persist and replace temp id with real Firestore id
      const saved = await logActivityDoc(uid, partial);
      setState((s) => ({
        ...s,
        activities: s.activities.map((a) => (a.id === tempId ? saved : a)),
      }));
    },
    [uid],
  );

  const setParticipation = useCallback(
    async (programmeId: string, status: "joined" | "declined") => {
      if (!uid) return;
      const participation = {
        programmeId,
        status,
        joinedAt: new Date().toISOString(),
      };
      setState((s) => ({
        ...s,
        participations: { ...s.participations, [programmeId]: participation },
      }));
      await setParticipationDoc(uid, participation);
    },
    [uid],
  );

  const setConsent = useCallback(
    async (key: keyof JeevaState["consent"], value: boolean) => {
      if (!uid) return;
      setState((s) => ({ ...s, consent: { ...s.consent, [key]: value } }));
      await updateConsentDoc(uid, key, value);
    },
    [uid],
  );

  const reset = useCallback(() => {
    setState(EMPTY);
    try {
      window.localStorage.removeItem(CACHE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────
  const value = useMemo<JeevaContextValue>(() => {
    const today = dateKey();
    const todayCheckIn = state.checkIns[today] ?? null;

    const active = new Set([
      ...Object.keys(state.checkIns),
      ...state.activities.map((a) => a.dateKey),
    ]);
    const consistencyDays = lastNDateKeys(7).filter((k) => active.has(k)).length;

    const onboardingStatus: OnboardingStatus = !state.profile
      ? "profile"
      : !state.baseline
        ? "baseline"
        : "complete";

    return {
      state,
      hydrated,
      loading,
      onboardingStatus,
      todayCheckIn,
      consistencyDays,
      saveProfile,
      submitBaseline,
      saveCheckIn,
      logActivity,
      setParticipation,
      setConsent,
      reset,
    };
  }, [
    state,
    hydrated,
    loading,
    saveProfile,
    submitBaseline,
    saveCheckIn,
    logActivity,
    setParticipation,
    setConsent,
    reset,
  ]);

  return <JeevaContext.Provider value={value}>{children}</JeevaContext.Provider>;
}

export function useJeeva() {
  const ctx = useContext(JeevaContext);
  if (!ctx) throw new Error("useJeeva must be used inside JeevaProvider");
  return ctx;
}
