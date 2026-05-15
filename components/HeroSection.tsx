"use client";

import { useChatWidget } from "@/components/providers/ChatWidgetProvider";

const features = [
  {
    icon: "🧠",
    title: "RAG-Powered",
    description:
      "Retrieval-augmented answers grounded in your actual course material.",
    color: "bg-sea/10 text-sea border-sea/20",
    dot: "bg-sea",
  },
  {
    icon: "🤖",
    title: "AI Tutor",
    description:
      "GPT-4o-mini explains concepts clearly, concisely, and accurately.",
    color: "bg-sun/10 text-sun border-sun/20",
    dot: "bg-sun",
  },
  {
    icon: "🧑‍🏫",
    title: "Mentor Fallback",
    description:
      "Low-confidence answers are automatically escalated to a real mentor.",
    color: "bg-coral/10 text-coral border-coral/20",
    dot: "bg-coral",
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
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-sea/10 blur-[120px]" />
        <div className="absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-sun/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-sea/5 blur-[80px]" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Eyebrow */}
        <div className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-sea/20 bg-sea/5 px-4 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-sea" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-sea">
            Powered by RAG + GPT-4o
          </span>
        </div>

        {/* Headline */}
        <h2 className="mt-6 animate-fade-in-up text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
          AI Doubt Solver for{" "}
          <span className="bg-gradient-to-r from-sea to-teal-400 bg-clip-text text-transparent">
            Smarter Learning
          </span>
        </h2>

        {/* Subtext */}
        <p
          className="mx-auto mt-5 max-w-xl animate-fade-in-up text-lg leading-relaxed text-slate-600"
          style={{ animationDelay: "0.1s" }}
        >
          Ask any doubt and get instant, context-aware answers powered by AI —
          grounded in your course material and backed by real mentors.
        </p>

        {/* CTA */}
        <div
          className="mt-8 flex animate-fade-in-up flex-wrap items-center justify-center gap-4"
          style={{ animationDelay: "0.2s" }}
        >
          <button
            onClick={openWidget}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl"
          >
            <span>Start Asking Doubts</span>
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
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
          <a
            href="/doubts"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-sea hover:text-sea"
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
              className={`rounded-2xl border bg-white/80 p-5 text-left shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:shadow-panel ${feature.color}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{feature.icon}</span>
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${feature.dot}`} />
                  <h3 className="font-semibold text-ink">{feature.title}</h3>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
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
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Preview
          </p>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-panel">
            {/* Mock widget header */}
            <div className="flex items-center gap-3 border-b border-slate-100 bg-ink px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sea text-xs font-bold text-white">
                AI
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">AI Tutor</p>
                <p className="text-xs text-white/60">Grounded answers in seconds</p>
              </div>
              <div className="ml-auto flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-coral/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-sun/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-sea/80" />
              </div>
            </div>

            {/* Mock messages */}
            <div className="space-y-3 p-4">
              {mockMessages.map((message, index) => (
                <div
                  key={index}
                  className={`rounded-2xl p-4 text-left ${
                    message.role === "student"
                      ? "bg-slate-50"
                      : "bg-ink text-white"
                  }`}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        message.role === "student"
                          ? "text-sea"
                          : "text-white/60"
                      }`}
                    >
                      {message.role === "student" ? "Student" : "AI Tutor"}
                    </span>
                    {message.role === "ai" && message.confidence && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/80">
                        {message.confidence}% confidence
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${
                      message.role === "student"
                        ? "text-slate-700"
                        : "text-slate-200"
                    }`}
                  >
                    {message.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Mock input */}
            <div className="border-t border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5">
                <span className="flex-1 text-sm text-slate-400">
                  Ask a doubt...
                </span>
                <button
                  onClick={openWidget}
                  className="rounded-lg bg-sea px-3 py-1 text-xs font-semibold text-white transition hover:bg-teal-700"
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
