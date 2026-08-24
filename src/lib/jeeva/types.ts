export type DimensionKey = "stress" | "focus" | "energy" | "sleep" | "emotional";

export type Profile = {
  name: string;
  ageGroup: string;
  role: string;
  department: string;
  wellbeingGoal: string;
  gender?: string;
};

export type Assessment = {
  answers: Record<DimensionKey, number>;
  dimensions: Record<DimensionKey, number>;
  score: number;
  submittedAt: string;
};

export type CheckIn = {
  dateKey: string;
  stress: number;
  energy: number;
  focus: number;
  mood: number;
  createdAt: string;
};

export type ActivityType =
  | "meditation"
  | "yoga"
  | "exercise"
  | "breathing"
  | "walking"
  | "sleep"
  | "journaling"
  | "other";

export type Activity = {
  id: string;
  dateKey: string;
  type: ActivityType;
  durationMinutes: number;
  note?: string;
  createdAt: string;
};

export type Participation = {
  programmeId: string;
  status: "joined" | "declined";
  joinedAt: string;
};

export type Programme = {
  id: string;
  name: string;
  organisation: string;
  dates: string;
  venue: string;
  active: boolean;
  summary?: string;
  startsLabel?: string;
};

export type OnboardingStatus = "new" | "profile" | "baseline" | "complete";

export type JeevaState = {
  profile: Profile | null;
  baseline: Assessment | null;
  checkIns: Record<string, CheckIn>;
  activities: Activity[];
  participations: Record<string, Participation>;
  consent: { aggregateInsights: boolean; identifiableSharing: boolean; research: boolean };
};

// Activity type config — used by the log-activity UI
export const ACTIVITY_TYPES: { key: ActivityType; label: string }[] = [
  { key: "meditation", label: "Meditation" },
  { key: "yoga", label: "Yoga" },
  { key: "exercise", label: "Exercise" },
  { key: "breathing", label: "Breathing" },
  { key: "walking", label: "Walking" },
  { key: "sleep", label: "Sleep" },
  { key: "journaling", label: "Journaling" },
  { key: "other", label: "Other" },
];
