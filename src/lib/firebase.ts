/**
 * Firebase client SDK — Participant app.
 *
 * Credentials are read from environment variables (Vite exposes VITE_* vars).
 * Copy .env.local.example to .env.local and fill in your project values.
 * NEVER commit .env.local.
 *
 * For now the credentials are also set as fallbacks from the original project
 * values to avoid breaking the dev environment on first run without .env.local.
 */
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey:
    (import.meta.env["VITE_FIREBASE_API_KEY"] as string | undefined) ??
    "AIzaSyDZaDP9vJPuxdqxg823IKuuJZYkQJpVORA",
  authDomain:
    (import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] as string | undefined) ??
    "jeevalife-f393a.firebaseapp.com",
  projectId:
    (import.meta.env["VITE_FIREBASE_PROJECT_ID"] as string | undefined) ??
    "jeevalife-f393a",
  storageBucket:
    (import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] as string | undefined) ??
    "jeevalife-f393a.firebasestorage.app",
  messagingSenderId:
    (import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] as string | undefined) ??
    "944471010865",
  appId:
    (import.meta.env["VITE_FIREBASE_APP_ID"] as string | undefined) ??
    "1:944471010865:web:4d728f269b32d944536f10",
  measurementId:
    (import.meta.env["VITE_FIREBASE_MEASUREMENT_ID"] as string | undefined) ??
    "G-SKNGWV631W",
};

// Avoid duplicate app initialization during HMR
const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : (getApps()[0] ?? initializeApp(firebaseConfig));

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics only works in the browser
export const analytics = isSupported().then((supported) =>
  supported ? getAnalytics(app) : null,
);

export default app;
