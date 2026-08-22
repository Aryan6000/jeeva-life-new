import type { Assessment, DimensionKey } from "./types";

export const DIMENSIONS: {
  key: DimensionKey;
  label: string;
  question: string;
  reverse: boolean;
  minLabel: string;
  maxLabel: string;
}[] = [
  {
    key: "stress",
    label: "Stress",
    question: "How overwhelmed have you felt during the past week?",
    reverse: true,
    minLabel: "Not at all",
    maxLabel: "Extremely",
  },
  {
    key: "focus",
    label: "Focus",
    question: "How easily could you stay focused on study or work?",
    reverse: false,
    minLabel: "Not at all",
    maxLabel: "Very easily",
  },
  {
    key: "energy",
    label: "Energy",
    question: "How steady was your energy through a typical day?",
    reverse: false,
    minLabel: "Very low",
    maxLabel: "Very steady",
  },
  {
    key: "sleep",
    label: "Sleep",
    question: "How rested did you feel after waking?",
    reverse: false,
    minLabel: "Not rested",
    maxLabel: "Fully rested",
  },
  {
    key: "emotional",
    label: "Emotional wellbeing",
    question: "How balanced and positive did you feel overall?",
    reverse: false,
    minLabel: "Not at all",
    maxLabel: "Very balanced",
  },
];

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  stress: "Stress balance",
  focus: "Focus",
  energy: "Energy",
  sleep: "Sleep",
  emotional: "Emotional wellbeing",
};

/** V1 rule: positive dimensions rating x 20, stress balance (6 - rating) x 20. */
export function scoreDimensions(
  answers: Record<DimensionKey, number>,
): Record<DimensionKey, number> {
  return {
    stress: (6 - answers.stress) * 20,
    focus: answers.focus * 20,
    energy: answers.energy * 20,
    sleep: answers.sleep * 20,
    emotional: answers.emotional * 20,
  };
}

export function overallScore(dimensions: Record<DimensionKey, number>): number {
  const values = Object.values(dimensions);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function buildAssessment(answers: Record<DimensionKey, number>): Assessment {
  const dimensions = scoreDimensions(answers);
  return {
    answers,
    dimensions,
    score: overallScore(dimensions),
    submittedAt: new Date().toISOString(),
  };
}

export function scoreBand(score: number): string {
  if (score >= 80) return "Very good";
  if (score >= 65) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 35) return "Low";
  return "Needs care";
}

/** Single application-timezone dateKey helper (Asia/Kolkata for the Tezpur programme). */
export function dateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function lastNDateKeys(n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(dateKey(d));
  }
  return out;
}
