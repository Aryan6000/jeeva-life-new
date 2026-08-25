#!/usr/bin/env node
/**
 * deploy-rules.js
 * Deploys Firestore security rules using the REST API + service account.
 *
 * Usage: node scripts/deploy-rules.js
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { GoogleAuth } from "google-auth-library";

const __dirname = dirname(fileURLToPath(import.meta.url));

const keyPath = join(__dirname, "serviceAccountKey.json");
if (!existsSync(keyPath)) {
  console.error("serviceAccountKey.json not found in scripts/");
  process.exit(1);
}

const rulesPath = join(__dirname, "..", "firestore.rules");
const rulesContent = readFileSync(rulesPath, "utf-8");

const serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));
const projectId = serviceAccount.project_id;

const auth = new GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

const client = await auth.getClient();
const token = await client.getAccessToken();

// Use the Firestore Rules REST API
const url = `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`;

const response = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token.token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    source: {
      files: [{ name: "firestore.rules", content: rulesContent }],
    },
  }),
});

if (!response.ok) {
  const err = await response.text();
  console.error("Failed to create ruleset:", err);
  process.exit(1);
}

const ruleset = await response.json();
const rulesetName = ruleset.name;
console.log("✓ Ruleset created:", rulesetName);

// Now release the ruleset to the default Firestore database
const releaseUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`;
const releaseResponse = await fetch(releaseUrl, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token.token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    release: { name: `projects/${projectId}/releases/cloud.firestore`, rulesetName },
  }),
});

if (!releaseResponse.ok) {
  const err = await releaseResponse.text();
  console.error("Failed to release ruleset:", err);
  process.exit(1);
}

console.log("✓ Firestore rules deployed successfully!");
