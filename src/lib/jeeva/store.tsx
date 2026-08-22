import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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

const STORAGE_KEY = "jeevalife.v1";

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
  hydrated: boolean;
  onboardingStatus: OnboardingStatus;
  todayCheckIn: CheckIn | null;
  consistencyDays: number;
  saveProfile: (profile: Profile) => void;
  submitBaseline: (answers: Record<DimensionKey, number>) => Assessment;
  saveCheckIn: (input: Omit<CheckIn, "dateKey" | "createdAt">) => void;
  logActivity: (input: { type: ActivityType; durationMinutes: number; note?: string }) => void;
  setParticipation: (programmeId: string, status: "joined" | "declined") => void;
  setConsent: (key: keyof JeevaState["consent"], value: boolean) => void;
  reset: () => void;
};

const JeevaContext = createContext<JeevaContextValue | null>(null);

export function JeevaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<JeevaState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...EMPTY, ...(JSON.parse(raw) as JeevaState) });
    } catch {
      /* ignore corrupt drafts */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state, hydrated]);

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
      onboardingStatus,
      todayCheckIn,
      consistencyDays,
      saveProfile: (profile) => setState((s) => ({ ...s, profile })),
      submitBaseline: (answers) => {
        const assessment = buildAssessment(answers);
        setState((s) => (s.baseline ? s : { ...s, baseline: assessment }));
        return assessment;
      },
      saveCheckIn: (input) => {
        const key = dateKey();
        setState((s) => ({
          ...s,
          checkIns: {
            ...s.checkIns,
            [key]: { ...input, dateKey: key, createdAt: new Date().toISOString() },
          },
        }));
      },
      logActivity: (input) => {
        const activity: Activity = {
          id: `${Date.now()}`,
          dateKey: dateKey(),
          createdAt: new Date().toISOString(),
          ...input,
        };
        setState((s) => ({ ...s, activities: [activity, ...s.activities] }));
      },
      setParticipation: (programmeId, status) =>
        setState((s) => ({
          ...s,
          participations: {
            ...s.participations,
            [programmeId]: { programmeId, status, joinedAt: new Date().toISOString() },
          },
        })),
      setConsent: (key, val) =>
        setState((s) => ({ ...s, consent: { ...s.consent, [key]: val } })),
      reset: () => setState(EMPTY),
    };
  }, [state, hydrated]);

  return <JeevaContext.Provider value={value}>{children}</JeevaContext.Provider>;
}

export function useJeeva() {
  const ctx = useContext(JeevaContext);
  if (!ctx) throw new Error("useJeeva must be used inside JeevaProvider");
  return ctx;
}
