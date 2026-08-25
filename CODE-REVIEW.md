# JeevaLife — code review

**Date:** 2026-08-23
**Reviewed at commit:** `dbbe549` ("frontend done")
**Scope:** participant app (`src/`), standalone admin app (`admin/`), Firestore rules, Firebase config, seed scripts, build health.

## Health check summary

| Check | Result |
| --- | --- |
| `tsc --noEmit` | **Clean** — zero type errors |
| `npm run lint` | **10,459 problems**, of which 10,322 are `Delete ␍` (CRLF). Real issues: 1 `prefer-const`, 1 `react-refresh` warning |
| `npm run build` | Last built successfully on this machine at 14:03 today (`dist/client` + `dist/server` present). Not re-run during review — see note below |
| Route protection | **None** — no `beforeLoad`, no `redirect`, no `isAdmin` check in any route |

The build was not re-executed because `node_modules` contains only Windows native bindings (`@rolldown/binding-win32-x64-msvc`, `lightningcss-win32-x64-msvc`); a Linux run would fail on missing platform binaries and tell you nothing useful, and re-running risked clobbering your working `dist/`. Type safety is verified independently and is clean.

## The three things to fix before anyone sees this

### 1. The app has no authentication gate at all — Critical

No route in `src/routes/` defines `beforeLoad` or `redirect`. `useAuth` appears in exactly two files, and only to call `signOut` and to drive the login form:

```
src/routes/profile.index.tsx:28   const { signOut } = useAuth();
src/routes/auth.tsx:31            const { signInWithGoogle, signInWithEmail, ... } = useAuth();
```

Every screen — `/home`, `/check-in`, `/activities/log`, `/journey`, `/profile`, `/onboarding/*`, `/programs/*` — renders in full for a signed-out visitor who types the URL. This is verified, not inferred.

The admin dashboards are in the same position, and worse: `src/routes/admin.index.tsx` and its four siblings have no auth check, `public/robots.txt` is `Allow: /` for every crawler, and the participant Programs screen ships a visible link straight to them at `src/routes/programs.index.tsx:38`. Today those pages render constants from `src/lib/jeeva/demo.ts`, so only fabricated names leak — but there is no gate to put real data behind, and the pages are admin-branded and indexable.

`isAdmin` is computed correctly from the Firebase custom claim in `src/lib/jeeva/auth.tsx:70` and then never read by any consumer anywhere in the codebase.

**Fix:** add a pathless layout route that awaits auth resolution and throws `redirect({ to: "/auth" })` when there is no user; add a second guard on the `/admin` tree keyed on the `admin` claim; add `Disallow: /admin` to robots.txt.

### 2. Silent write failures that report success — Critical

Every mutation in `src/lib/jeeva/store.tsx` (lines 137, 159, 179, 203, 220) opens with `if (!uid) return;`, and no mutation has a `catch`. Callers use `try { ... } finally { setSaving(false) }` — never `catch`. So in `src/routes/check-in.tsx:51-58` the user gets `toast.success("Today's check-in saved")` and is navigated to `/home` even when nothing was written.

Two reachable paths: a signed-out user (per finding 1), and a signed-in user who hard-reloads `/check-in`, `/activities/log` or `/programs/$id` and submits before `onAuthStateChanged` resolves — none of those three screens gate on `hydrated` (only `src/routes/onboarding.profile.tsx:130` does). A Firestore permission-denied also leaves the optimistic value in memory, so the UI keeps claiming the check-in exists until the next reload.

**Fix:** throw on missing `uid`, wrap mutation bodies in try/catch, roll back the optimistic state slice on failure, rethrow so the screen can `toast.error`, and disable submit buttons until `hydrated`.

### 3. Every admin query is denied by your own security rules — Critical

`admin/src/lib/firestore.ts` runs collection-group queries at lines 145, 171, 197, 227 and 266:

```ts
collectionGroup(db, "participations")
collectionGroup(db, "checkIns")
```

`firestore.rules` only permits these paths via nested `match /users/{uid}/checkIns/{dateKey}` blocks (lines 59-63, 75-79). Firestore does **not** apply path-scoped subcollection rules to collection-group queries — those require a rule written with a leading recursive wildcard. The terminal `match /{document=**} { allow read, write: if false; }` at lines 136-138 then denies them. Overview, Participants, Assessments and Reports will all fail with `permission-denied` on load.

**Fix:** add collection-group rules and deploy them:

```
match /{path=**}/participations/{pid} { allow read: if isAdmin(); }
match /{path=**}/checkIns/{dateKey}  { allow read: if isAdmin(); }
```

Separately, `admin/src/lib/firestore.ts:339-345` combines `where("programmeId","==",…)` with `orderBy("date","asc")` on `sessions`, which needs a composite index. `firestore.indexes.json` has no `sessions` entry, so Attendance fails with `failed-precondition`.

## You have two admin apps, and the weaker one is the live one

`admin/` is a standalone Vite + React Router app that queries live Firestore and gates login on the admin claim. `src/routes/admin.*.tsx` is a second implementation of the same five screens that renders hardcoded constants and has no login. **The mock is the one users can reach.**

`admin/` is referenced by exactly one line in the whole repo — `firebase.json:20` (`"public": "admin/dist"`) — plus prose in `BACKEND.md:131`. Root `package.json` has no reference to it, no workspaces, no build script that enters it. And nothing under `admin/` is tracked by git (`git ls-files admin` returns nothing), so the better implementation is uncommitted work sitting at risk of being lost.

**Decide one way or the other**, then delete the loser. If you keep `admin/`, commit it and wire it into the build; if you keep the in-app routes, port the live Firestore layer across.

## Deployment is currently broken

`firebase.json:6-17` sets `"public": "dist"` with a `**` → `/index.html` rewrite, but the root build is TanStack Start + Nitro SSR: it emits `dist/client/` and `dist/server/server.js` and **no `dist/index.html`**. There is also no `.firebaserc`, so the `participant` and `admin` hosting targets are unresolvable and `firebase deploy --only hosting` cannot run at all.

`README.md:35-39` compounds this — it tells you the build lands in `.output/` and to run `node .output/server/index.mjs`. No `.output/` directory exists; the build emits `dist/`. The README instructions will not work as written.

## Data-integrity bugs

**Profile never loads back from Firestore.** `src/lib/jeeva/firestore.ts:347` reads `userDoc?.["profile" as keyof UserDoc]`, but `getUserDoc` (lines 69-88) builds its return object field by field and never includes `profile`. The cast silences the type error. Profile is therefore always `null` after a reload, even though `saveProfileDoc` wrote it correctly.

**Returning users are forced back through onboarding.** `src/routes/auth.tsx:39-43` reads `onboardingStatus` captured at click time, when `JeevaProvider` state is still `EMPTY`, so it always evaluates to `"profile"`. Combined with the bug above, every login dumps the user into "Basic profile".

**Re-taking the assessment silently discards the answers.** `src/lib/jeeva/store.tsx:150` returns early with `if (state.baseline) return state.baseline;`. Three screens link to `/onboarding/assessment` (`profile.index.tsx:64-73`, `profile.wellbeing.tsx:60-65`, `journey.tsx:152-158`) and that screen never checks for an existing baseline. The user answers five questions and is shown their *old* score with no explanation.

**"Reset demo data" resets nothing.** `src/routes/profile.index.tsx:106-116` calls `reset()`, which per `store.tsx:227-234` clears local state and the localStorage cache and issues no Firestore deletes. The user is told "Demo data reset" and everything reappears on reload. On a consent and privacy screen, that is the wrong promise to break.

**Unknown programme ids write to Tezpur.** `src/routes/programs.$id.tsx:32-35` falls back to `TEZPUR_PROGRAMME` for any unmatched id, so `/programs/typo` renders a real programme and `submit()` enrolls the user in `participations/cche-2026`. Should `throw notFound()`.

**Three racing writes on first sign-up.** `AuthProvider` (`auth.tsx:62-81`) and `JeevaProvider` (`store.tsx:84-131`) each subscribe to `onAuthStateChanged` independently, and the three sign-in helpers each also call `ensureUserDoc` (`auth.tsx:133,151,169`). On a new sign-up all three see `snap.exists() === false` at `firestore.ts:98` and all issue `setDoc`. This also produces two unsynchronised `loading` flags, which is the root cause of the onboarding-redirect bug above.

## Wellbeing numbers that are wrong or fabricated

**Stress is reverse-scored with no scale labels.** `src/components/jeeva/controls.tsx:46-89` — `RatingRow` accepts no `minLabel`/`maxLabel` (unlike `RatingScale` above it), so all four rows in `check-in.tsx:72-98` render a bare `1 2 3 4 5` in identical styling. But `home.tsx:31` and `journey.tsx:45` compute `(6 - stress)`, so 5 means *worse* for that one row. A user reading 5 as "good" everywhere inverts their own stress score, corrupting the exact number the app exists to track. `aria-label` is just `"Stress 5"`, so screen-reader users get no direction either.

**"Progress vs baseline" shows a false `+0`.** `home.tsx:29-38` and `journey.tsx:43-50` fall back to `currentScore = baselineScore` when there is no check-in today, so `change` is `0` rather than `null` and the card renders "+0 points". A user who improved for three months but hasn't checked in yet today is told their progress is zero.

**90 days of check-ins are loaded and never aggregated.** `loadUserState` fetches 90 check-ins (`firestore.ts:336`) but Journey only reads `todayCheckIn`. The headline "Current" figure swings day to day and reverts to baseline whenever the user skips a day.

**Hardcoded percentages presented as personal stats.** `journey.tsx:137-143` renders `JOURNEY_CONSISTENCY.practice` (76%) and `.checkIn` (83%) with no `SyntheticBadge` — the badge at line 94 covers only the trend chart above. Meanwhile the real value, `consistencyDays`, is already computed at `store.tsx:245` and unused. Every user sees identical numbers on a health-tracking screen.

**Admin "current" score is a copy of "baseline".** `admin/src/lib/firestore.ts:417-425` sets `current: avg` — the same value as `baseline` — and it is then rendered as `{baseline} → {current}` in `Assessments.tsx:66-69`, as two distinct chart series in `Reports.tsx:117-118`, and exported to CSV at `Reports.tsx:61-65`. The outcome report will always show zero change with no indication it is a placeholder.

**Synthetic labelling regressed in the standalone admin app.** `src/components/jeeva/admin-shell.tsx:65` correctly renders `<SyntheticBadge />`; `admin/src/components/AdminShell.tsx:85-87` replaces it with an unconditional **"Live data"** pill — while `admin/src/lib/firestore.ts:216-217` silently substitutes `avgBaseline` for `avgCurrent` when there are no recent check-ins and line 36 fabricates `new Date()` for missing timestamps. This is the inverse of the spec's labelling requirement. Note `metricSnapshots` appears only in `firestore.rules:121-127` and is never written or read by any code.

**Attendance is permanently zero.** `scripts/seed-programmes.js:80-83` seeds `present: 0, registered: 0`, nothing ever writes back to `sessions.present`, and `markAttendance` (`admin/src/lib/firestore.ts:359-377`) is exported with zero call sites. The page always shows 0 and 0% under a "Live data" badge, while `BACKEND.md:153,180` claims attendance is complete.

## Privacy — the UI makes a claim the code contradicts

`admin/src/lib/firestore.ts:322-330` returns real `profile.name`, `profile.role` and `profile.department`, rendered at `Participants.tsx:97-99` beside a "masked" `P-${index}` id, which makes the masking decorative. This contradicts three separate on-screen assertions: `AdminShell.tsx:108-110` ("All reports show aggregated, de-identified data"), `Overview.tsx:119` ("No personal data is visible"), and the file's own header comment at lines 5-6. `users/{uid}.consent.identifiableSharing` — default `false` per `BACKEND.md:43` — is never consulted anywhere.

Also, `admin/src/lib/firestore.ts:178` and `:386` both do an unfiltered `getDocs(collection(db,"assessments"))`, pulling every participant's raw `answers` map into the admin's browser to average locally. Only means are rendered, but the raw answers are in the network tab and the JS heap — which is what the spec's "no raw individual answers" rule exists to prevent. Aggregation belongs in an Admin SDK job writing `metricSnapshots`.

## Performance

`admin/src/lib/firestore.ts:276-331` loops over up to 200 participations and `await`s four separate reads per participant with no batching — up to ~800 serialised round trips and ~800 billed reads per page load. `Promise.all` the per-participant work and replace the per-user attendance probe with one grouped query.

Lines 169-174 and 195-200 run byte-identical `collectionGroup("checkIns")` queries twice per Overview load. The four retention windows at 225-230 re-scan the same group at 7/30/60/90 days, where the 90-day scan is a superset of the other three. Eight uncapped full-collection scans per render, none with `limit()`.

Overview's programme metrics (lines 163, 169-175, 178-217, 221-235) ignore `programmeId` entirely and count across the whole project, while rendering under the heading "Collective Consciousness for Human Excellence 2026 · Tezpur University" (`Overview.tsx:46-49`). Every figure will overstate as soon as a second programme exists.

## Housekeeping

**Lint is effectively disabled by CRLF noise.** `.prettierrc` omits `endOfLine`, so on Windows checkouts Prettier flags every line in the repo. 10,322 of 10,459 problems are `Delete ␍`, burying the 2 real ones. Add `"endOfLine": "auto"` to `.prettierrc` (or set `* text=auto eol=lf` in `.gitattributes`), then re-run — after that, `npm run lint` becomes a usable signal again.

**Firebase config hardcoded as fallbacks.** `src/lib/firebase.ts:18-38` and `admin/src/lib/firebase.ts:17-36` embed the real project values (`jeevalife-f393a`, api key, sender id, app id) behind `??` defaults. Web API keys are public by design, so this is not a credential leak — the actual risk is that a developer with no `.env.local` silently reads and writes **production** data while believing they are local. Remove the fallbacks and fail fast if the env vars are absent.

`.env.local.example` contains those same real values and is **not** covered by `.gitignore` (only `.env.local` and `admin/.env.local` are). It is currently untracked, so nothing has leaked, but the next `git add .` will commit it. Replace the values with placeholders.

Credential handling in `scripts/` is clean: no service-account JSON or private key exists on disk, `scripts/serviceAccountKey.json` is gitignored, and `set-admin-claim.js:31-59` and `seed-programmes.js:27-38` both resolve credentials via env or ADC with nothing embedded.

**`admin/` is outside every quality gate.** No `eslint.config.js` there, so its `"lint": "eslint ."` errors out; no `typecheck` script, so its `strict` and `noUncheckedIndexedAccess` settings are never enforced. `firebase-admin` — a Node-only SDK — is declared as a runtime dependency of a browser bundle at `admin/package.json:28` with zero imports under `admin/src/`. Minor: `admin/index.html:5` requests `/favicon.ico` but `admin/` has no `public/`, and the two `ContextSelect` chips at `src/components/jeeva/admin-shell.tsx:74-77` look like programme pickers but are inert `<span>`s.

**DST bug in date arithmetic.** `src/lib/jeeva/scoring.ts:107-115` builds keys with `d.setDate(d.getDate() - i)` and then formats in Asia/Kolkata. `setDate` preserves local wall-clock time, so the UTC instant shifts across a DST boundary. On a device in `America/New_York` at 2026-11-02 14:00 EST the keys come out `2026-11-03, 2026-11-02, 2026-10-31` — **Nov 1 is skipped** — so `consistencyDays` under-reports for DST-zone users around a transition. Decrement parsed y/m/d instead.

**Shared SSR error state.** `src/lib/error-capture.ts:4-9` keeps `lastCapturedError` in a module-level singleton that `server.ts:31` consumes when building a 500 page. Under concurrency, request A's error page can be logged with request B's stack trace within the 5s TTL. Key it per request via `AsyncLocalStorage`.

**Firebase touched during SSR.** `src/lib/firebase.ts:52` runs `isSupported().then(...)` at module top level with no `.catch`, so `firebase/analytics` is evaluated server-side and a rejection becomes an unhandled rejection in the server process. `getAuth`/`getFirestore`/`getStorage` also run during SSR because `__root.tsx` imports the providers.

## Suggested order of work

1. Add the auth guard and the `/admin` claim check; remove the participant-facing "Admin view" link. *(Critical, blocks demo)*
2. Deploy collection-group rules and the `sessions` composite index, or the admin dashboard cannot load at all. *(Critical)*
3. Make mutations throw and roll back; stop showing success toasts for writes that did not happen. *(Critical)*
4. Pick one admin app, delete the other, and commit it.
5. Fix the profile round-trip and the auth-redirect race — together they break every returning user's login.
6. Label the Stress scale and stop rendering fabricated numbers as personal data.
7. Fix `firebase.json` / add `.firebaserc` / correct the README build paths.
8. Add `endOfLine` to `.prettierrc` so lint is usable, then run `npm run format`.

## What this review did not cover

The app was not run against a live Firebase project, so the rules and index findings are derived from reading `firestore.rules` and `firestore.indexes.json` against the query code rather than from observed runtime failures — they are worth confirming with the Firestore emulator suite, which would also give you regression tests for the rules. No visual or responsive-design pass was done against the design board, and `src/components/ui/` was treated as vendored shadcn/ui boilerplate and skipped.
