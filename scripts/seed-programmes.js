#!/usr/bin/env node
/**
 * seed-programmes.js
 *
 * Seeds the Firestore `programmes` and `sessions` collections with the
 * Tezpur University 2026 event data defined in the frontend demo.ts.
 *
 * Safe to run multiple times — uses setDoc with merge:false only if the
 * document does not already exist.
 *
 * Usage:
 *   node scripts/seed-programmes.js
 *
 * Requires same credentials as set-admin-claim.js.
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Credentials (same as set-admin-claim.js) ──────────────────────────────

function getServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  }
  const localKeyPath = join(__dirname, "serviceAccountKey.json");
  if (existsSync(localKeyPath)) {
    return JSON.parse(readFileSync(localKeyPath, "utf-8"));
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return undefined;
  console.error("No Firebase credentials found.");
  process.exit(1);
}

const serviceAccount = getServiceAccount();
if (getApps().length === 0) {
  initializeApp(serviceAccount ? { credential: cert(serviceAccount) } : undefined);
}

const db = getFirestore();

// ── Seed data ─────────────────────────────────────────────────────────────────

const PROGRAMMES = [
  {
    id: "cche-2026",
    name: "Collective Consciousness for Human Excellence 2026",
    organisation: "Tezpur University",
    dates: "28 - 30 August 2026",
    venue: "KBR Auditorium",
    active: true,
    cohortId: "tezpur-2026",
  },
  {
    id: "better-sleep",
    name: "Better Sleep",
    organisation: "JeevaLife",
    dates: "Starts 12 July 2026",
    venue: "Online",
    active: false,
    summary: "Build healthy sleep habits and wake up refreshed",
  },
  {
    id: "focus-performance",
    name: "Focus & Performance",
    organisation: "JeevaLife",
    dates: "Starts 26 July 2026",
    venue: "Online",
    active: false,
    summary: "Sharpen your focus and enhance productivity",
  },
];

const SESSIONS = [
  { id: "cche-2026-s01", programmeId: "cche-2026", title: "Opening session", date: "2026-08-28", present: 0, registered: 0 },
  { id: "cche-2026-s02", programmeId: "cche-2026", title: "Practice session A", date: "2026-08-29", present: 0, registered: 0 },
  { id: "cche-2026-s03", programmeId: "cche-2026", title: "Practice session B", date: "2026-08-29", present: 0, registered: 0 },
  { id: "cche-2026-s04", programmeId: "cche-2026", title: "Closing session", date: "2026-08-30", present: 0, registered: 0 },
];

// ── Upsert helper (only creates, never overwrites) ────────────────────────────

async function createIfMissing(collectionName, id, data) {
  const ref = db.collection(collectionName).doc(id);
  const snap = await ref.get();
  if (snap.exists) {
    console.log(`  ↷ ${collectionName}/${id} already exists — skipped`);
    return;
  }
  await ref.set({ ...data, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
  console.log(`  ✓ Created ${collectionName}/${id}`);
}

// ── Run ────────────────────────────────────────────────────────────────────────

console.log("Seeding programmes…");
for (const p of PROGRAMMES) {
  const { id, ...rest } = p;
  await createIfMissing("programmes", id, rest);
}

console.log("Seeding sessions…");
for (const s of SESSIONS) {
  const { id, ...rest } = s;
  await createIfMissing("sessions", id, rest);
}

console.log("Done.");
