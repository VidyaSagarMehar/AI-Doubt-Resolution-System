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

  // ─── Widget mode (compact single-column) ──────────────────────────────
  if (mode === "widget") {
    return (
      <div className="flex flex-col gap-5">
        {/* Input form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {user ? (
            <p className="mb-3 text-xs text-slate-500">
              Signed in as{" "}
              <span className="font-semibold text-ink">{user.name}</span>
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="widget-title"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Doubt title
              </label>
              <input
                id="widget-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Why does binary search need sorted input?"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sea focus:bg-white"
                required
              />
            </div>
            <div>
              <label
                htmlFor="widget-description"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Describe your doubt
              </label>
              <textarea
                id="widget-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write your full question, what you tried, and where you got stuck."
                className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-sea focus:bg-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || authLoading || !user}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
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
            <p className="mt-2 text-xs text-coral">{error}</p>
          ) : null}
        </div>

        {/* Result */}
        {result ? (
          <div ref={resultRef} className="space-y-3">
            {/* Question recap */}
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-sea">
                Student
              </p>
              <p className="mt-1.5 text-sm font-medium text-ink">
                {result.doubt.title}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
                {result.doubt.description}
              </p>
            </div>

            {/* AI answer */}
            <div className="rounded-2xl bg-ink p-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  AI Tutor
                </p>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold">
                  {(result.aiResponse.confidenceScore).toFixed(1)}% confidence
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">
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
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 transition hover:border-sea hover:text-sea"
              >
                Open full thread →
              </button>
            </div>

            {/* Recommendations — collapsible to save space */}
            {result.aiResponse.recommendedResources.length > 0 ? (
              <details className="rounded-2xl border border-slate-200 bg-white">
                <summary className="cursor-pointer select-none px-4 py-3 text-xs font-semibold text-slate-600">
                  📚 {result.aiResponse.recommendedResources.length} Recommended
                  Resources
                </summary>
                <div className="border-t border-slate-100 px-4 pb-4 pt-3">
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
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sea/10 text-2xl">
              💬
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">
                Ask your first doubt
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Fill in the form above and hit <strong>Ask AI Tutor</strong>.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  // ─── Page mode (original two-column layout) ───────────────────────────
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sea text-lg font-semibold text-white">
              S
            </div>
            <div>
              <p className="text-sm text-slate-500">Student question</p>
              <h3 className="text-xl font-semibold text-ink">Ask your doubt</h3>
              {user ? (
                <p className="mt-1 text-sm text-slate-500">
                  Signed in as {user.name} ({user.email})
                </p>
              ) : null}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Doubt title
              </label>
              <input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Why does binary search need sorted input?"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sea focus:bg-white"
                required
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Describe the doubt
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Write the full question, what you tried, and where you got stuck."
                className="min-h-44 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sea focus:bg-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || authLoading || !user}
              className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Generating answer..."
                : authLoading
                  ? "Loading session..."
                  : "Ask AI Tutor"}
            </button>
          </form>
          {error ? <p className="text-sm text-coral">{error}</p> : null}
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sun text-lg font-semibold text-white">
              AI
            </div>
            <div>
              <p className="text-sm text-slate-500">Tutor response</p>
              <h3 className="text-xl font-semibold text-ink">Grounded answer</h3>
            </div>
          </div>

          {result ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sea">
                  Student
                </p>
                <p className="mt-2 font-medium text-ink">{result.doubt.title}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                  {result.doubt.description}
                </p>
              </div>
              <div className="rounded-3xl bg-ink p-4 text-white">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                    AI Tutor
                  </p>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                    Confidence {(result.aiResponse.confidenceScore * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-100">
                  {result.aiResponse.answer}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    router.push(`/doubts/${result.doubt._id}` as Route)
                  }
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-sea hover:text-sea"
                >
                  Open full thread
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-7 text-slate-600">
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
