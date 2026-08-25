import type { Assessment, DimensionKey } from "./types";

/**
 * Scoring model:
 *
 *   4 dimensions, each rated 1–5 by the user.
 *   Dimension score  = rating × 5  →  range 5–25  (max 25 per question)
 *   Stress is reversed: score = (6 − rating) × 5
 *
 *   Overall score = sum of all 4 dimension scores
 *                 = max 4 × 25 = 100
 *
 *   Example — user answers all 5:
 *     Stress    5 → reversed → (6-5)×5 =  5  ← high stress = low score
 *     Focus     5 →            5×5     = 25
 *     Energy    5 →            5×5     = 25
 *     Sleep     5 →            5×5     = 25
 *                              total  = 80 / 100
 *
 *   Example — perfect wellbeing (stress=1, rest=5):
 *     Stress    1 → (6-1)×5 = 25
 *     Focus     5 →  5×5    = 25
 *     Energy    5 →  5×5    = 25
 *     Sleep     5 →  5×5    = 25
 *                    total  = 100 / 100
 */

// Only 4 dimensions are used for scoring (emotional removed to keep total = 100)
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
];

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  stress: "Stress balance",
  focus: "Focus",
  energy: "Energy",
  sleep: "Sleep",
  emotional: "Emotional wellbeing",
};

/**
 * Each dimension: rating × 5 = score out of 25.
 * Stress is reversed.
 * emotional is not part of baseline scoring but kept for check-in mood.
 */
export function scoreDimensions(
  answers: Record<DimensionKey, number>,
): Record<DimensionKey, number> {
  return {
    stress:    (6 - answers.stress) * 5,   // reversed
    focus:     answers.focus   * 5,
    energy:    answers.energy  * 5,
    sleep:     answers.sleep   * 5,
    emotional: answers.emotional * 5,      // kept for completeness / check-in
  };
}

/**
 * Overall score = sum of the 4 baseline dimensions (stress, focus, energy, sleep).
 * Max = 4 × 25 = 100.
 */
export function overallScore(dimensions: Record<DimensionKey, number>): number {
  const { stress, focus, energy, sleep } = dimensions;
  return Math.min(100, Math.round(stress + focus + energy + sleep));
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

/** dateKey in Asia/Kolkata timezone (YYYY-MM-DD). */
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
