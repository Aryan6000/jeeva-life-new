import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { X, Lightbulb, ArrowRight } from "lucide-react";
import welcomeArt from "@/assets/welcome-meditation.jpg";

// ✏️ Change the YouTube video ID here to update the popup video https://youtu.be/-jVYPe8ulV4
const YOUTUBE_VIDEO_ID = "-jVYPe8ulV4";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JeevaLife — Small daily practices, meaningful progress" },
      { name: "description", content: "JeevaLife is a wellbeing platform for everyday practice." },
      { property: "og:title", content: "JeevaLife — Small daily practices, meaningful progress" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const [showVideo, setShowVideo] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowVideo(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const close = () => { setShowVideo(false); setPlaying(false); };

  return (
    <>
      {/* ── Video popup ──────────────────────────────────────────────────── */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-[420px] overflow-hidden rounded-3xl bg-background shadow-2xl">

            {/* Close button */}
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
            >
              <X className="size-4" strokeWidth={2} />
            </button>

            <div className="px-6 pb-6 pt-8">
              {/* Title */}
              <h2 className="text-center text-[22px] font-bold tracking-tight text-foreground">
                Welcome to JeevaLife!
              </h2>
              <p className="mt-2 text-center text-[13px] leading-relaxed text-muted-foreground">
                Before you begin, watch this short video to understand how JeevaLife can help you grow every day.
              </p>

              {/* Video */}
              <div className="mt-5 overflow-hidden rounded-2xl bg-black">
                {!playing ? (
                  /* Thumbnail with play button */
                  <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    className="relative block w-full"
                    aria-label="Play video"
                  >
                    <img
                      src={welcomeArt}
                      alt="JeevaLife intro"
                      className="h-[200px] w-full object-cover"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      {/* JeevaLife watermark */}
                      <div className="absolute left-3 top-3 flex items-center gap-1.5">
                        <span className="flex size-6 items-center justify-center rounded-full bg-primary-soft text-[10px] font-bold text-primary">J</span>
                        <span className="text-[11px] font-semibold text-white drop-shadow">JeevaLife</span>
                      </div>
                      {/* Play button — proper triangle */}
                      <span className="flex size-14 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-105">
                        <svg viewBox="0 0 24 24" className="size-6 translate-x-0.5 text-white" fill="currentColor">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </span>
                    </div>
                    {/* Duration bar mock */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/80">▶</span>
                        <div className="h-1 flex-1 rounded-full bg-white/30">
                          <div className="h-1 w-0 rounded-full bg-primary" />
                        </div>
                        <span className="text-[10px] text-white/80">0:00 / 6:30</span>
                      </div>
                    </div>
                  </button>
                ) : (
                  /* Actual YouTube embed after click */
                  <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                    <iframe
                      className="absolute inset-0 h-full w-full border-0"
                      src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0`}
                      title="JeevaLife intro video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              {/* Why watch hint */}
              <div className="mt-4 flex items-start gap-3 rounded-2xl bg-primary-soft px-4 py-3">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.8} />
                <div>
                  <p className="text-[12px] font-semibold text-primary">Why watch?</p>
                  <p className="text-[12px] text-muted-foreground">
                    It only takes 6 minutes and will show you how small daily practices lead to meaningful progress.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <Link
                to="/auth"
                onClick={close}
                className="mt-4 flex h-[50px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Continue to JeevaLife
                <ArrowRight className="size-4" strokeWidth={2.5} />
              </Link>

              {/* Skip */}
              <button
                type="button"
                onClick={close}
                className="mt-3 w-full text-center text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Welcome page ─────────────────────────────────────────────────── */}
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
    </>
  );
}
