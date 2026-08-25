# JeevaLife Backend — Implementation Guide

## Architecture

JeevaLife uses **Firebase as the backend**:

| Layer | Technology |
|---|---|
| Authentication | Firebase Auth (Google OAuth + Email/Password) |
| Database | Cloud Firestore |
| Admin SDK | firebase-admin (server scripts only) |
| File storage | Firebase Storage (available, not yet used) |
| Hosting | Firebase Hosting (two targets: participant + admin) |

---

## Two Separate Apps

| App | Folder | Port | Purpose |
|---|---|---|---|
| Participant app | `/` (root) | 5173 | End-user wellness tracking |
| Admin portal | `/admin` | 5174 | Programme administrator dashboard |

The admin portal is a **completely separate Vite app**. It is never served from the same origin as the participant app.

---

## Firestore Database Schema

### `users/{uid}`
```
uid: string
email: string | null
displayName: string | null
photoURL: string | null
onboardingStatus: "profile_pending" | "assessment_pending" | "complete"
role: "participant" | "admin"  ← NEVER trust client-supplied; set via Admin SDK only
profile: {
  name, ageGroup, role, department, wellbeingGoal, gender?
}
consent: {
  aggregateInsights: boolean   (default: true)
  identifiableSharing: boolean (default: false)
  research: boolean            (default: false)
}
createdAt, updatedAt: Timestamp
```

### `users/{uid}/checkIns/{dateKey}`
```
dateKey: string  (YYYY-MM-DD, Asia/Kolkata timezone)
stress, energy, focus, mood: number (1–5)
createdAt, updatedAt: Timestamp
```
One document per user per day. Upsert semantics — saving again updates the same record.

### `users/{uid}/activities/{autoId}`
```
dateKey: string
type: "meditation" | "yoga" | "exercise" | "breathing" | "walking" | "sleep" | "journaling" | "other"
durationMinutes: number (≥ 1)
note?: string
createdAt: Timestamp
```
**Immutable after creation** — no client updates or deletes allowed (enforced in security rules).

### `users/{uid}/participations/{programmeId}`
```
programmeId: string
status: "joined" | "declined"
joinedAt, updatedAt: Timestamp
```

### `assessments/{uid}`
One document per user — **immutable baseline**. Never overwritten.
```
uid, answers, dimensions, score, submittedAt, createdAt: Timestamp
```

### `programmes/{programmeId}`
```
id, name, organisation, dates, venue, active, summary?, cohortId?
createdAt, updatedAt: Timestamp
```

### `sessions/{sessionId}`
```
programmeId, title, date, present, registered
createdAt, updatedAt: Timestamp
```

### `attendance/{programmeId_sessionId_uid}`
```
uid, programmeId, sessionId, present, markedAt: Timestamp
```
Written only by admin portal. Participants cannot mark themselves present.

---

## Setup

### 1. Firebase project
The project is already configured: `jeevalife-f393a`

### 2. Deploy Firestore security rules
```bash
npx firebase-tools deploy --only firestore:rules
```

### 3. Deploy Firestore indexes
```bash
npx firebase-tools deploy --only firestore:indexes
```

### 4. Seed programmes
```bash
# Place your serviceAccountKey.json in scripts/ (gitignored)
node scripts/seed-programmes.js
```

### 5. Grant admin access to a user
First, have the user sign in to the participant app to create their user document.
Then get their Firebase UID from the Firebase Console → Authentication, and run:
```bash
node scripts/set-admin-claim.js <uid>
```
The user must **sign out and sign back in** for the claim to take effect.

### 6. Admin portal setup
```bash
cd admin
cp .env.local.example .env.local
# Fill in .env.local with Firebase project values
npm install
npm run dev   # runs on port 5174
```

### 7. Participant app
```bash
# In the root directory:
npm run dev   # runs on port 5173
```

---

## Security

- **Firestore rules** enforce that users can only access their own data.
- **Admin role** is determined exclusively from Firebase ID token custom claims (`admin === true`).
- **Admin portal** verifies the admin claim on every auth state change; any user without the claim is immediately signed out.
- **Baseline assessments** are immutable from the client — create-only, no updates.
- **Activities** are immutable after creation from the client.
- **Attendance** is written only from the admin portal, never self-reported.
- No client-supplied `role`, `uid`, or permission field is ever trusted.
- Passwords are never stored — handled entirely by Firebase Auth.
- Service account key is gitignored and never committed.

---

## Gap Analysis (PDF vs Implementation)

| Requirement | Status |
|---|---|
| Google OAuth sign-in | ✅ Complete |
| Email/password sign-in | ✅ Complete |
| User document creation on first login | ✅ Complete |
| Admin custom claims (server-side only) | ✅ Complete |
| Profile CRUD → Firestore | ✅ Complete |
| Baseline assessment → Firestore (immutable) | ✅ Complete |
| Daily check-in → Firestore | ✅ Complete |
| Activity logging → Firestore (immutable) | ✅ Complete |
| Programme participation → Firestore | ✅ Complete |
| Consent preferences → Firestore | ✅ Complete |
| Firestore security rules | ✅ Complete |
| Firestore indexes | ✅ Complete |
| Admin portal (separate app) | ✅ Complete |
| Admin login with claim verification | ✅ Complete |
| Admin overview (live Firestore data) | ✅ Complete |
| Admin participants (de-identified) | ✅ Complete |
| Admin attendance | ✅ Complete |
| Admin assessments (aggregate only) | ✅ Complete |
| Admin reports with CSV export | ✅ Complete |
| set-admin-claim server script | ✅ Complete |
| seed-programmes server script | ✅ Complete |
| localStorage replaced with Firestore | ✅ Complete |
| Auth state survives page refresh | ✅ Complete |
| Optimistic UI updates | ✅ Complete |
| Journey trend (real check-in data) | ⚠️ Partially — trend chart still uses synthetic demo data |
| Post-programme re-assessment | ❌ P1 scope — not in current release |
| Push notifications | ❌ P1 scope |
| CSV export (attendance details) | ❌ P1 scope |
| AI recommendations | ❌ P2 scope |
| Community features | ❌ P2 scope |
