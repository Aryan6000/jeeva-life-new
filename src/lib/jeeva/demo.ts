import type { ActivityType, Programme } from "./types";

export const TEZPUR_PROGRAMME: Programme = {
  id: "cche-2026",
  name: "Collective Consciousness for Human Excellence 2026",
  organisation: "Tezpur University",
  dates: "28 - 30 August 2026",
  venue: "KBR Auditorium",
  active: true,
};

export const UPCOMING_PROGRAMMES: Programme[] = [
  {
    id: "better-sleep",
    name: "Better Sleep",
    organisation: "JeevaLife",
    dates: "Starts 12 July 2026",
    venue: "Online",
    active: false,
    summary: "Build healthy sleep habits and wake up refreshed",
    startsLabel: "Starts 12 July 2026",
  },
  {
    id: "focus-performance",
    name: "Focus & Performance",
    organisation: "JeevaLife",
    dates: "Starts 26 July 2026",
    venue: "Online",
    active: false,
    summary: "Sharpen your focus and enhance productivity",
    startsLabel: "Starts 26 July 2026",
  },
];

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

/** Clearly labelled synthetic snapshots used for the Tezpur event demo. */
export const SYNTHETIC = true;

export const JOURNEY_TREND: Record<"30" | "60" | "90", { label: string; score: number }[]> = {
  "30": [
    { label: "Apr 22", score: 68 },
    { label: "Apr 29", score: 66 },
    { label: "May 6", score: 70 },
    { label: "May 13", score: 69 },
    { label: "May 20", score: 73 },
    { label: "May 27", score: 71 },
    { label: "Jun 3", score: 74 },
    { label: "Jun 10", score: 75 },
    { label: "Jun 17", score: 76 },
  ],
  "60": [
    { label: "Mar 18", score: 63 },
    { label: "Apr 1", score: 65 },
    { label: "Apr 15", score: 68 },
    { label: "Apr 29", score: 67 },
    { label: "May 13", score: 71 },
    { label: "May 27", score: 72 },
    { label: "Jun 10", score: 75 },
    { label: "Jun 17", score: 76 },
  ],
  "90": [
    { label: "Feb 18", score: 60 },
    { label: "Mar 4", score: 62 },
    { label: "Mar 18", score: 64 },
    { label: "Apr 1", score: 66 },
    { label: "Apr 15", score: 68 },
    { label: "Apr 29", score: 69 },
    { label: "May 13", score: 71 },
    { label: "May 27", score: 73 },
    { label: "Jun 10", score: 75 },
    { label: "Jun 17", score: 76 },
  ],
};

export const JOURNEY_CONSISTENCY = {
  practice: 76,
  checkIn: 83,
  practiceTrend: [58, 62, 61, 68, 70, 72, 76],
  checkInTrend: [70, 72, 75, 74, 79, 81, 83],
};

export const ADMIN_OVERVIEW = {
  registered: 246,
  attended: 182,
  active: 153,
  baselineComplete: 221,
  retention: [
    { range: "7 days", value: 78 },
    { range: "30 days", value: 64 },
    { range: "60 days", value: 56 },
    { range: "90 days", value: 51 },
  ],
  wellbeing: { baseline: 66, current: 73 },
  engagement: {
    practiceFrequency: "4.2 days/week",
    checkInFrequency: "5.1 days/week",
    programmeCompletion: "68%",
  },
};

export const ADMIN_PARTICIPANTS = [
  { id: "P-1042", name: "Aarav Sharma", role: "Student", cohort: "University-wide", attendance: "Present", engagement: "Active" },
  { id: "P-1043", name: "Ishita Baruah", role: "Student", cohort: "University-wide", attendance: "Present", engagement: "Active" },
  { id: "P-1044", name: "Rohan Das", role: "Faculty", cohort: "University-wide", attendance: "Absent", engagement: "Dormant" },
  { id: "P-1045", name: "Priya Nath", role: "Student", cohort: "University-wide", attendance: "Present", engagement: "Active" },
  { id: "P-1046", name: "Kabir Saikia", role: "Staff", cohort: "University-wide", attendance: "Present", engagement: "Occasional" },
  { id: "P-1047", name: "Meera Bora", role: "Student", cohort: "University-wide", attendance: "Absent", engagement: "Active" },
  { id: "P-1048", name: "Dhruv Kalita", role: "Student", cohort: "University-wide", attendance: "Present", engagement: "Active" },
];

export const ADMIN_SESSIONS = [
  { id: "S-01", title: "Opening session", date: "28 August 2026", present: 182, registered: 246 },
  { id: "S-02", title: "Practice session A", date: "29 August 2026", present: 164, registered: 246 },
  { id: "S-03", title: "Practice session B", date: "29 August 2026", present: 158, registered: 246 },
  { id: "S-04", title: "Closing session", date: "30 August 2026", present: 171, registered: 246 },
];

export const ADMIN_ASSESSMENTS = [
  { dimension: "Stress balance", baseline: 62, current: 71 },
  { dimension: "Focus", baseline: 71, current: 76 },
  { dimension: "Energy", baseline: 64, current: 72 },
  { dimension: "Sleep", baseline: 60, current: 69 },
  { dimension: "Emotional wellbeing", baseline: 73, current: 78 },
];
