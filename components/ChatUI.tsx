"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { RecommendationList } from "@/components/RecommendationList";
import type { AIResponsePayload, DoubtDetail } from "@/types";

type ChatUIProps = {
  mode?: "page" | "widget";
  onClose?: () => void;
};

export function ChatUI({ mode = "page", onClose }: ChatUIProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    doubt: DoubtDetail;
    aiResponse: AIResponsePayload;
  } | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to result in widget mode
  useEffect(() => {
    if (result && mode === "widget" && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result, mode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const doubtResponse = await fetch("/api/doubts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const doubtPayload = await doubtResponse.json();

      if (!doubtResponse.ok) {
        throw new Error(doubtPayload.error ?? "Failed to create doubt.");
      }

      const doubt = doubtPayload.data as DoubtDetail;

      const aiResponse = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doubtId: doubt._id }),
      });
      const aiPayload = await aiResponse.json();

      if (!aiResponse.ok) {
        throw new Error(aiPayload.error ?? "Failed to generate AI answer.");
      }

      setResult({ doubt, aiResponse: aiPayload.data });
      setTitle("");
      setDescription("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Spinner SVG ──────────────────────────────────────────────────── */
  const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );

  /* ════════════════════════════════════════════════════════════════════
     WIDGET mode — compact single-column
  ════════════════════════════════════════════════════════════════════ */
  if (mode === "widget") {
    return (
      <div className="flex flex-col gap-4">
        {/* Input card */}
        <div className="rounded-xl border border-brand-border bg-brand-bg p-4">
          {user ? (
            <p className="mb-3 text-xs text-brand-neutral/60">
              Signed in as{" "}
              <span className="font-medium text-brand-text">{user.name}</span>
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="widget-title"
                className="mb-1 block text-xs font-medium text-brand-neutral/80"
              >
                Doubt title
              </label>
              <input
                id="widget-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Why does binary search need sorted input?"
                className="!rounded-xl !py-2 !text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="widget-description"
                className="mb-1 block text-xs font-medium text-brand-neutral/80"
              >
                Describe your doubt
              </label>
              <textarea
                id="widget-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write your full question, what you tried, and where you got stuck."
                className="!min-h-24 !rounded-xl !py-2 !text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || authLoading || !user}
              className="font-display inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-brand-bg transition-all duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Spinner />
                  Generating answer…
                </>
              ) : authLoading ? (
                "Loading session…"
              ) : (
                "Ask AI Tutor"
              )}
            </button>
          </form>

          {error ? (
            <p className="mt-2 rounded-lg border border-brand-accent/30 bg-brand-accent/10 px-3 py-2 text-xs text-brand-accent">
              {error}
            </p>
          ) : null}
        </div>

        {/* Result */}
        {result ? (
          <div ref={resultRef} className="space-y-3">
            {/* Question recap */}
            <div className="rounded-xl border border-brand-border bg-brand-bg p-4">
              <p className="font-display text-xs font-semibold uppercase tracking-wider text-brand-link">
                Student
              </p>
              <p className="mt-1.5 text-sm font-medium text-brand-text">
                {result.doubt.title}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-brand-neutral/70">
                {result.doubt.description}
              </p>
            </div>

            {/* AI answer */}
            <div className="rounded-xl border border-brand-accent/25 bg-brand-accent/8 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-xs font-semibold uppercase tracking-wider text-brand-accent">
                  AI Tutor
                </p>
                <span className="rounded-full border border-brand-success/30 bg-brand-success/10 px-2.5 py-0.5 text-xs font-semibold text-brand-success">
                  {(result.aiResponse.confidenceScore).toFixed(1)}% confidence
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-brand-neutral/90">
                {result.aiResponse.answer}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  router.push(`/doubts/${result.doubt._id}` as Route);
                  onClose?.();
                }}
                className="font-display rounded-full border border-brand-link/40 px-4 py-2 text-xs font-medium text-brand-link transition-all duration-150 hover:bg-brand-link/10"
              >
                Open full thread →
              </button>
            </div>

            {/* Recommendations — collapsible */}
            {result.aiResponse.recommendedResources.length > 0 ? (
              <details className="rounded-xl border border-brand-border bg-brand-bg">
                <summary className="cursor-pointer select-none px-4 py-3 text-xs font-semibold text-brand-neutral/70">
                  📚 {result.aiResponse.recommendedResources.length} Recommended
                  Resources
                </summary>
                <div className="border-t border-brand-border px-4 pb-4 pt-3">
                  <RecommendationList
                    resources={result.aiResponse.recommendedResources}
                    title=""
                  />
                </div>
              </details>
            ) : null}
          </div>
        ) : !loading ? (
          /* Empty state */
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-brand-border bg-brand-bg px-4 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-accent/25 bg-brand-accent/8 text-2xl">
              💬
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-brand-text">
                Ask your first doubt
              </p>
              <p className="mt-1 text-xs text-brand-neutral/60">
                Fill in the form above and hit <strong>Ask AI Tutor</strong>.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════
     PAGE mode — two-column layout
  ════════════════════════════════════════════════════════════════════ */
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* Left — input */}
      <section className="rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-panel">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand-accent/30 bg-brand-accent/10">
              <span className="font-display text-sm font-bold text-brand-accent">S</span>
            </div>
            <div>
              <p className="text-xs text-brand-neutral/60">Student question</p>
              <h3 className="font-display text-lg font-semibold text-brand-text">
                Ask your doubt
              </h3>
              {user ? (
                <p className="mt-0.5 text-xs text-brand-neutral/60">
                  Signed in as {user.name} ({user.email})
                </p>
              ) : null}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-brand-neutral/80"
              >
                Doubt title
              </label>
              <input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Why does binary search need sorted input?"
                required
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-brand-neutral/80"
              >
                Describe the doubt
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Write the full question, what you tried, and where you got stuck."
                className="!min-h-44"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || authLoading || !user}
              className="font-display inline-flex items-center gap-2 rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-brand-bg transition-all duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Spinner />
                  Generating answer...
                </>
              ) : authLoading ? (
                "Loading session..."
              ) : (
                "Ask AI Tutor"
              )}
            </button>
          </form>
          {error ? (
            <p className="rounded-lg border border-brand-accent/30 bg-brand-accent/10 px-4 py-2.5 text-sm text-brand-accent">
              {error}
            </p>
          ) : null}
        </div>
      </section>

      {/* Right — response */}
      <section className="space-y-6">
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand-link/30 bg-brand-link/10">
              <span className="font-display text-xs font-bold text-brand-link">AI</span>
            </div>
            <div>
              <p className="text-xs text-brand-neutral/60">Tutor response</p>
              <h3 className="font-display text-lg font-semibold text-brand-text">
                Grounded answer
              </h3>
            </div>
          </div>

          {result ? (
            <div className="mt-5 space-y-4">
              {/* Student question recap */}
              <div className="rounded-xl border border-brand-border bg-brand-bg p-4">
                <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-brand-link">
                  Student
                </p>
                <p className="mt-2 font-medium text-brand-text">{result.doubt.title}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-brand-neutral/70">
                  {result.doubt.description}
                </p>
              </div>

              {/* AI answer */}
              <div className="rounded-xl border border-brand-accent/25 bg-brand-accent/8 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">
                    AI Tutor
                  </p>
                  <span className="rounded-full border border-brand-success/30 bg-brand-success/10 px-3 py-1 text-xs font-semibold text-brand-success">
                    Confidence {(result.aiResponse.confidenceScore * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-brand-neutral/90">
                  {result.aiResponse.answer}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    router.push(`/doubts/${result.doubt._id}` as Route)
                  }
                  className="font-display rounded-full border border-brand-link/40 px-4 py-2 text-sm font-medium text-brand-link transition-all duration-150 hover:bg-brand-link/10"
                >
                  Open full thread
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-7 text-brand-neutral/60">
              Your AI answer will appear here once the doubt is submitted and the RAG
              pipeline finishes.
            </p>
          )}
        </div>

        <RecommendationList
          title="Recommended Learning Resources"
          resources={result?.aiResponse.recommendedResources ?? []}
        />
      </section>
    </div>
  );
}
