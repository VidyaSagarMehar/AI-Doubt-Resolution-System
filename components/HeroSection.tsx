"use client";

import { useChatWidget } from "@/components/providers/ChatWidgetProvider";

const features = [
  {
    icon: "🧠",
    title: "RAG-Powered",
    description:
      "Retrieval-augmented answers grounded in your actual course material.",
  },
  {
    icon: "🤖",
    title: "AI Tutor",
    description:
      "GPT-4o-mini explains concepts clearly, concisely, and accurately.",
  },
  {
    icon: "🧑‍🏫",
    title: "Mentor Fallback",
    description:
      "Low-confidence answers are automatically escalated to a real mentor.",
  },
];

const mockMessages = [
  {
    role: "student",
    text: "Why does binary search require a sorted array?",
  },
  {
    role: "ai",
    text: "Binary search works by repeatedly halving the search space. For this to be valid, the algorithm must reliably discard half the elements — which only works if the array is sorted.",
    confidence: 92,
  },
];

export function HeroSection() {
  const { openWidget } = useChatWidget();

  return (
    <div className="relative flex min-h-[calc(100vh-73px)] flex-col items-center justify-center overflow-hidden px-4 py-16">
      {/* Subtle ambient glow — brand-accent only, very low opacity */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-60 -top-60 h-[600px] w-[600px] rounded-full bg-brand-accent/5 blur-[140px]" />
        <div className="absolute -right-60 bottom-0 h-[500px] w-[500px] rounded-full bg-brand-link/4 blur-[120px]" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-brand-accent/25 bg-brand-accent/8 px-4 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
          <span className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-brand-accent">
            Powered by RAG + GPT-4o
          </span>
        </div>

        {/* Headline */}
        <h2 className="font-display mt-6 animate-fade-in-up text-4xl font-bold leading-tight tracking-tight text-brand-text sm:text-5xl lg:text-6xl">
          AI Doubt Solver for{" "}
          <span className="text-brand-accent">Smarter Learning</span>
        </h2>

        {/* Subtext */}
        <p
          className="mx-auto mt-5 max-w-xl animate-fade-in-up text-base leading-relaxed text-brand-neutral/70"
          style={{ animationDelay: "0.1s" }}
        >
          Ask any doubt and get instant, context-aware answers powered by AI —
          grounded in your course material and backed by real mentors.
        </p>

        {/* CTAs */}
        <div
          className="mt-8 flex animate-fade-in-up flex-wrap items-center justify-center gap-4"
          style={{ animationDelay: "0.2s" }}
        >
          {/* Primary CTA */}
          <button
            onClick={openWidget}
            className="font-display group inline-flex items-center gap-2 rounded-full bg-brand-accent px-7 py-3.5 text-sm font-semibold text-brand-bg transition-all duration-200 hover:brightness-110 active:scale-95"
          >
            <span>Start Asking Doubts</span>
            <svg
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>

          {/* Secondary CTA */}
          <a
            href="/doubts"
            className="font-display inline-flex items-center gap-2 rounded-full border border-brand-link px-6 py-3.5 text-sm font-medium text-brand-link transition-all duration-200 hover:bg-brand-link/10"
          >
            View My Doubts
          </a>
        </div>

        {/* Feature cards */}
        <div
          className="mt-14 grid animate-fade-in-up gap-4 sm:grid-cols-3"
          style={{ animationDelay: "0.3s" }}
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-brand-border bg-brand-surface p-5 text-left transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{feature.icon}</span>
                <h3 className="font-display font-semibold text-brand-text">
                  {feature.title}
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-brand-neutral/70">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mock chat preview */}
        <div
          className="mx-auto mt-14 max-w-md animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <p className="font-display mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand-neutral/50">
            Preview
          </p>
          <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-card">
            {/* Widget header */}
            <div className="flex items-center gap-3 border-b border-brand-border bg-brand-bg px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-accent/15 border border-brand-accent/30">
                <span className="font-display text-xs font-bold text-brand-accent">AI</span>
              </div>
              <div className="text-left">
                <p className="font-display text-sm font-semibold text-brand-text">AI Tutor</p>
                <p className="text-xs text-brand-neutral/50">Grounded answers in seconds</p>
              </div>
              <div className="ml-auto flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-neutral/20" />
                <span className="h-2 w-2 rounded-full bg-brand-neutral/20" />
                <span className="h-2 w-2 rounded-full bg-brand-neutral/20" />
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3 p-4">
              {mockMessages.map((message, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-4 text-left ${
                    message.role === "student"
                      ? "bg-brand-bg border border-brand-border"
                      : "bg-brand-accent/10 border border-brand-accent/20"
                  }`}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span
                      className={`font-display text-xs font-semibold uppercase tracking-wider ${
                        message.role === "student"
                          ? "text-brand-link"
                          : "text-brand-accent"
                      }`}
                    >
                      {message.role === "student" ? "Student" : "AI Tutor"}
                    </span>
                    {message.role === "ai" && message.confidence && (
                      <span className="rounded-full border border-brand-success/30 bg-brand-success/10 px-2 py-0.5 text-xs font-semibold text-brand-success">
                        {message.confidence}% confidence
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-brand-neutral/80">
                    {message.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Mock input */}
            <div className="border-t border-brand-border px-4 py-3">
              <div className="flex items-center gap-2 rounded-xl border border-brand-border bg-brand-bg px-4 py-2.5">
                <span className="flex-1 text-sm text-brand-neutral/40">
                  Ask a doubt...
                </span>
                <button
                  onClick={openWidget}
                  className="font-display rounded-lg bg-brand-accent px-3 py-1 text-xs font-semibold text-brand-bg transition-all duration-150 hover:brightness-110"
                >
                  Ask
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease both;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease both;
        }
      `}</style>
    </div>
  );
}
