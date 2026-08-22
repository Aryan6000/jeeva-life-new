import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { MobileShell, PrimaryButton } from "@/components/jeeva/shell";
import { useJeeva } from "@/lib/jeeva/store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — JeevaLife" },
      {
        name: "description",
        content: "Sign in to JeevaLife to complete your profile, check in daily and follow your wellbeing progress.",
      },
      { property: "og:title", content: "Sign in — JeevaLife" },
      { property: "og:description", content: "Sign in to continue your JeevaLife wellbeing journey." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthScreen,
});

function AuthScreen() {
  const navigate = useNavigate();
  const { onboardingStatus } = useJeeva();

  const enter = () => {
    if (onboardingStatus === "profile") navigate({ to: "/onboarding/profile" });
    else if (onboardingStatus === "baseline") navigate({ to: "/onboarding/assessment" });
    else navigate({ to: "/home" });
  };

  return (
    <MobileShell bottomNav={false}>
      <div className="flex min-h-screen flex-col justify-center py-10">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-[17px] font-semibold text-primary">
            J
          </span>
          <span className="text-[19px] font-semibold tracking-tight">JeevaLife</span>
        </div>

        <h1 className="mt-8 text-[24px] font-semibold leading-tight tracking-tight">
          Sign in to continue
        </h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Your check-ins and assessments stay private to your account.
        </p>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={enter}
            className="jl-field flex h-[50px] w-full items-center justify-center gap-2 text-[15px] font-medium transition-colors hover:bg-muted"
          >
            <span className="text-[15px] font-semibold text-primary">G</span>
            Continue with Google
          </button>
          <button
            type="button"
            onClick={enter}
            className="jl-field flex h-[50px] w-full items-center justify-center gap-2 text-[15px] font-medium transition-colors hover:bg-muted"
          >
            <Mail className="size-4" strokeWidth={1.8} />
            Continue with email
          </button>
        </div>

        <div className="mt-8">
          <PrimaryButton onClick={enter}>Continue</PrimaryButton>
          <p className="pt-3 text-center text-[11px] text-muted-foreground">
            By continuing you agree that your responses are used for your own progress and
            aggregate programme reporting.
          </p>
        </div>
      </div>
    </MobileShell>
  );
}
