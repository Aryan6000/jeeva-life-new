import { createFileRoute, Link } from "@tanstack/react-router";
import welcomeArt from "@/assets/welcome-meditation.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JeevaLife — Small daily practices, meaningful progress" },
      {
        name: "description",
        content:
          "JeevaLife is a wellbeing platform for everyday practice: assess your baseline, check in daily, log activities and follow your progress.",
      },
      { property: "og:title", content: "JeevaLife — Small daily practices, meaningful progress" },
      {
        property: "og:description",
        content:
          "Understand, practise, track and improve your wellbeing with JeevaLife programmes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-[620px] flex-1 flex-col px-5 pb-8 pt-10">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-[17px] font-semibold text-primary">
            J
          </span>
          <span className="text-[19px] font-semibold tracking-tight">JeevaLife</span>
        </div>

        <h1 className="mt-8 text-[34px] font-semibold leading-[1.12] tracking-tight">
          Small daily
          <br />
          practices.
          <br />
          <span className="text-primary">Meaningful progress.</span>
        </h1>

        <p className="mt-4 text-[13px] text-muted-foreground">
          Understand · Practice · Track · Improve
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border">
          <img
            src={welcomeArt}
            alt="A person meditating at sunrise"
            width={1024}
            height={768}
            className="h-[240px] w-full object-cover sm:h-[300px]"
          />
        </div>

        <div className="mt-auto pt-8">
          <Link
            to="/auth"
            className="flex h-[50px] w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Get started
          </Link>
          <p className="pt-3 text-center text-[11px] text-muted-foreground">
            Your wellbeing journey begins here
          </p>
        </div>
      </div>
    </div>
  );
}
