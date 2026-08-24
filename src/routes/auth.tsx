import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Loader2, Mail, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { MobileShell, PrimaryButton } from "@/components/jeeva/shell";
import { useJeeva } from "@/lib/jeeva/store";
import { useAuth } from "@/lib/jeeva/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — JeevaLife" },
      { name: "description", content: "Sign in to JeevaLife to complete your profile, check in daily and follow your wellbeing progress." },
      { property: "og:title", content: "Sign in — JeevaLife" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AuthScreen,
});

type AuthView = "options" | "email";
type EmailMode = "signin" | "signup";

function AuthScreen() {
  const navigate = useNavigate();
  // Wait for the store to finish loading from Firestore before deciding where to go
  const { onboardingStatus, loading: storeLoading } = useJeeva();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, error, busy, clearError, user } = useAuth();

  const [view, setView] = useState<AuthView>("options");
  const [emailMode, setEmailMode] = useState<EmailMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // true while we're waiting for Firestore to load after successful auth
  const [waitingForLoad, setWaitingForLoad] = useState(false);

  // Once user is signed in AND store has finished loading, navigate to correct page
  useEffect(() => {
    if (!waitingForLoad) return;
    if (storeLoading) return; // still loading Firestore data — wait

    // Firestore load complete — now read the real onboarding status
    setWaitingForLoad(false);
    if (onboardingStatus === "profile") {
      navigate({ to: "/onboarding/profile" });
    } else if (onboardingStatus === "baseline") {
      navigate({ to: "/onboarding/assessment" });
    } else {
      navigate({ to: "/home" });
    }
  }, [waitingForLoad, storeLoading, onboardingStatus, navigate]);

  // If already signed in and store loaded, redirect immediately
  useEffect(() => {
    if (!user || storeLoading) return;
    if (onboardingStatus === "profile") {
      navigate({ to: "/onboarding/profile" });
    } else if (onboardingStatus === "baseline") {
      navigate({ to: "/onboarding/assessment" });
    } else {
      navigate({ to: "/home" });
    }
  }, [user, storeLoading, onboardingStatus, navigate]);

  const handleGoogle = async () => {
    const u = await signInWithGoogle();
    if (u) setWaitingForLoad(true); // trigger the effect above to wait for Firestore
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    const u = emailMode === "signup"
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password);
    if (u) setWaitingForLoad(true);
  };

  // Show a full-screen loader while waiting for Firestore after sign-in
  if (waitingForLoad || (storeLoading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-[13px] text-muted-foreground">Loading your account…</p>
        </div>
      </div>
    );
  }

  const openEmailView = () => {
    clearError();
    setView("email");
    setEmailMode("signin");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  const backToOptions = () => {
    clearError();
    setView("options");
  };

  // ── Email view ────────────────────────────────────────────────────────────
  if (view === "email") {
    return (
      <MobileShell bottomNav={false}>
        <div className="flex min-h-screen flex-col justify-center py-10">
          <button
            type="button"
            onClick={backToOptions}
            className="mb-6 flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" strokeWidth={1.8} />
            Back
          </button>

          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-[17px] font-semibold text-primary">J</span>
            <span className="text-[19px] font-semibold tracking-tight">JeevaLife</span>
          </div>

          <h1 className="mt-8 text-[24px] font-semibold leading-tight tracking-tight">
            {emailMode === "signup" ? "Create your account" : "Sign in with email"}
          </h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            {emailMode === "signup" ? "Enter your email and choose a password." : "Enter your email and password to continue."}
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="auth-email" className="block text-[13px] font-medium text-foreground">Email</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="jl-field mt-1.5 h-[48px] w-full px-3.5 text-[15px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label htmlFor="auth-password" className="block text-[13px] font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={emailMode === "signup" ? "new-password" : "current-password"}
                  placeholder="••••••••"
                  minLength={6}
                  className="jl-field mt-1.5 h-[48px] w-full px-3.5 pr-11 text-[15px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" strokeWidth={1.8} /> : <Eye className="size-4" strokeWidth={1.8} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="flex h-[50px] w-full items-center justify-center rounded-full text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  {emailMode === "signup" ? "Creating account…" : "Signing in…"}
                </span>
              ) : emailMode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            {emailMode === "signup" ? (
              <>Already have an account?{" "}
                <button type="button" onClick={() => { clearError(); setEmailMode("signin"); }} className="font-medium text-primary">Sign in</button>
              </>
            ) : (
              <>Don&apos;t have an account?{" "}
                <button type="button" onClick={() => { clearError(); setEmailMode("signup"); }} className="font-medium text-primary">Create one</button>
              </>
            )}
          </p>
        </div>
      </MobileShell>
    );
  }

  // ── Options view ──────────────────────────────────────────────────────────
  return (
    <MobileShell bottomNav={false}>
      <div className="flex min-h-screen flex-col justify-center py-10">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-[17px] font-semibold text-primary">J</span>
          <span className="text-[19px] font-semibold tracking-tight">JeevaLife</span>
        </div>

        <h1 className="mt-8 text-[24px] font-semibold leading-tight tracking-tight">Sign in to continue</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">Your check-ins and assessments stay private to your account.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>
        )}

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="flex h-[50px] w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-[15px] font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <span className="text-[15px] font-semibold text-primary">G</span>}
            Continue with Google
          </button>
          <button
            type="button"
            onClick={openEmailView}
            disabled={busy}
            className="flex h-[50px] w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-[15px] font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            <Mail className="size-4" strokeWidth={1.8} />
            Continue with email
          </button>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="flex h-[50px] w-full items-center justify-center rounded-full text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {busy ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Signing in…
              </span>
            ) : "Continue"}
          </button>
          <p className="pt-3 text-center text-[11px] text-muted-foreground">
            By continuing you agree that your responses are used for your own progress and aggregate programme reporting.
          </p>
        </div>
      </div>
    </MobileShell>
  );
}
