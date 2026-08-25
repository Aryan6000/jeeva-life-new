/**
 * Firebase Auth context.
 *
 * Responsibilities:
 *   - Expose the current Firebase User (or null while loading)
 *   - Provide sign-in / sign-up / sign-out helpers
 *   - On any successful authentication, ensure the Firestore user document
 *     exists (createUserDocIfMissing is idempotent — safe to call on every login)
 *   - Admin role is determined ONLY from Firebase custom claims, never from
 *     client-provided data
 */
import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserDocIfMissing } from "./firestore";

type AuthContextValue = {
  /** The currently signed-in Firebase user, or null if signed out. */
  user: User | null;
  /** True while we're still waiting for the initial auth check to finish. */
  loading: boolean;
  /** True if the user has the admin custom claim. Never trust client-side role. */
  isAdmin: boolean;
  /** Non-null when the last auth action failed. Cleared on the next attempt. */
  error: string | null;
  /** True while a sign-in / sign-up request is in flight. */
  busy: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signInWithEmail: (email: string, password: string) => Promise<User | null>;
  signUpWithEmail: (email: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Check for admin custom claim — never trust client-side data
        try {
          const idTokenResult = await firebaseUser.getIdTokenResult();
          setIsAdmin(idTokenResult.claims["admin"] === true);
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const friendlyError = (err: unknown): string => {
    if (err && typeof err === "object" && "code" in err) {
      const code = (err as { code: string }).code;
      switch (code) {
        case "auth/invalid-email":
          return "Please enter a valid email address.";
        case "auth/user-disabled":
          return "This account has been disabled.";
        case "auth/user-not-found":
          return "No account found with this email.";
        case "auth/wrong-password":
          return "Incorrect password. Please try again.";
        case "auth/invalid-credential":
          return "Invalid email or password. Please try again.";
        case "auth/email-already-in-use":
          return "An account with this email already exists. Try signing in instead.";
        case "auth/weak-password":
          return "Password must be at least 6 characters.";
        case "auth/popup-closed-by-user":
          return "Sign-in popup was closed. Please try again.";
        case "auth/cancelled-popup-request":
          return "";
        case "auth/network-request-failed":
          return "Network error. Please check your connection.";
        case "auth/too-many-requests":
          return "Too many attempts. Please wait a moment and try again.";
        default:
          return `Authentication error (${code}).`;
      }
    }
    return "Something went wrong. Please try again.";
  };

  /** Ensure Firestore user doc exists after successful auth. */
  const ensureUserDoc = async (u: User): Promise<void> => {
    try {
      await createUserDocIfMissing(u.uid, u.email, u.displayName, u.photoURL);
    } catch (err) {
      // Non-fatal — user can still use the app; Firestore write will retry
      console.error("Could not create user document:", err);
    }
  };

  const signInWithGoogle = useCallback(async (): Promise<User | null> => {
    setError(null);
    setBusy(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserDoc(result.user);
      return result.user;
    } catch (err) {
      const msg = friendlyError(err);
      if (msg) setError(msg);
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<User | null> => {
      setError(null);
      setBusy(true);
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await ensureUserDoc(result.user);
        return result.user;
      } catch (err) {
        setError(friendlyError(err));
        return null;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string): Promise<User | null> => {
      setError(null);
      setBusy(true);
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await ensureUserDoc(result.user);
        return result.user;
      } catch (err) {
        setError(friendlyError(err));
        return null;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      setError(friendlyError(err));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        error,
        busy,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
