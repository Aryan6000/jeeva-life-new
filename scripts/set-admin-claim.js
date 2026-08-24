#!/usr/bin/env node
/**
 * set-admin-claim.js
 *
 * Usage:
 *   node scripts/set-admin-claim.js <uid>          # grant admin
 *   node scripts/set-admin-claim.js <uid> --revoke  # revoke admin
 *
 * Requires:
 *   - FIREBASE_SERVICE_ACCOUNT_KEY env var or GOOGLE_APPLICATION_CREDENTIALS
 *   - Or place serviceAccountKey.json at scripts/serviceAccountKey.json
 *     (ensure this file is in .gitignore — NEVER commit it)
 *
 * Install:
 *   npm install firebase-admin --save-dev
 *
 * This is the ONLY way to grant admin access.
 * Admin role is NEVER settable from the client app.
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Initialise Firebase Admin ────────────────────────────────────────────────

function getServiceAccount() {
  // 1. Check for inline env var (CI/CD friendly)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch {
      console.error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON.");
      process.exit(1);
    }
  }

  // 2. Check for a local file (development)
  const localKeyPath = join(__dirname, "serviceAccountKey.json");
  if (existsSync(localKeyPath)) {
    return JSON.parse(readFileSync(localKeyPath, "utf-8"));
  }

  // 3. Fall back to GOOGLE_APPLICATION_CREDENTIALS (ADC)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return undefined; // firebase-admin will pick it up automatically
  }

  console.error(
    "No Firebase credentials found.\n" +
    "Set FIREBASE_SERVICE_ACCOUNT_KEY, GOOGLE_APPLICATION_CREDENTIALS,\n" +
    "or place serviceAccountKey.json in scripts/",
  );
  process.exit(1);
}

const serviceAccount = getServiceAccount();

if (getApps().length === 0) {
  initializeApp(
    serviceAccount
      ? { credential: cert(serviceAccount) }
      : undefined,
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

const [, , uid, flag] = process.argv;
const revoke = flag === "--revoke";

if (!uid) {
  console.error("Usage: node scripts/set-admin-claim.js <uid> [--revoke]");
  process.exit(1);
}

const adminAuth = getAuth();

try {
  // Verify the user exists first
  const user = await adminAuth.getUser(uid);
  console.log(`User found: ${user.email ?? user.uid}`);

  // Set or clear the admin custom claim
  await adminAuth.setCustomUserClaims(uid, { admin: !revoke });

  const action = revoke ? "revoked from" : "granted to";
  console.log(`✓ Admin claim ${action} ${user.email ?? uid}`);

  if (!revoke) {
    console.log("The user must sign out and sign back in for the claim to take effect.");
  }
} catch (err) {
  if (err && typeof err === "object" && "code" in err && err.code === "auth/user-not-found") {
    console.error(`No user found with UID: ${uid}`);
  } else {
    console.error("Error:", err instanceof Error ? err.message : err);
  }
  process.exit(1);
}
