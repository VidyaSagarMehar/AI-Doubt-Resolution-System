"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { toast } from "react-toastify";
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

  // Input state
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // History state
  const [history, setHistory] = useState<DoubtDetail[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Action states — scoped by doubtId
  const [feedbackLoadingId, setFeedbackLoadingId] = useState<string | null>(null);
  const [escalatingId, setEscalatingId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch history on mount
  useEffect(() => {
    if (!user) {
      setHistoryLoading(false);
      return;
    }
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/doubts");
        const payload = await response.json();
        if (response.ok && payload.data) {
          setHistory([...payload.data].reverse());
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      } finally {
        setHistoryLoading(false);
      }
    };
    void fetchHistory();
  }, [user]);

  // Auto-scroll to bottom when a new item is added
  useEffect(() => {
    if (history.length > 0 && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [history.length]);

  /* ── Submit doubt & get AI answer ─────────────────────────────────── */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const doubtResponse = await fetch("/api/doubts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const doubtPayload = await doubtResponse.json();

      if (!doubtResponse.ok) {
        throw new Error(doubtPayload.error ?? "Failed to create doubt.");
      }

      const doubt = doubtPayload.data as DoubtDetail;

      // Optimistically add it (without AI response yet)
      setHistory((prev) => [...prev, doubt]);
      setDescription("");

      const aiResponse = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doubtId: doubt._id }),
      });
      const aiPayload = await aiResponse.json();

      if (!aiResponse.ok) {
        throw new Error(aiPayload.error ?? "Failed to generate AI answer.");
      }

      // Update the doubt with the AI response
      setHistory((prev) =>
        prev.map((d) =>
          d._id === doubt._id ? { ...d, aiResponse: aiPayload.data } : d
        )
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Submit feedback ──────────────────────────────────────────────── */
  const submitFeedback = async (doubtId: string, isHelpful: boolean) => {
    setFeedbackLoadingId(doubtId);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doubtId, isHelpful }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to submit feedback.");

      setHistory((prev) =>
        prev.map((d) => {
          if (d._id === doubtId) {
            return {
              ...d,
              feedback: [
                ...(d.feedback || []),
                {
                  _id: "temp",
                  doubtId,
                  isHelpful,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              ]
            };
          }
          return d;
        })
      );

      toast.success(
        isHelpful
          ? "👍 Glad it helped! Feedback recorded."
          : "👎 Feedback noted. Consider escalating to a mentor.",
        { autoClose: 4000 }
      );
    } catch (err) {
      toast.error(`❌ ${err instanceof Error ? err.message : "Failed to submit feedback."}`);
    } finally {
      setFeedbackLoadingId(null);
    }
  };

  /* ── Escalate to mentor ───────────────────────────────────────────── */
  const escalate = async (doubtId: string) => {
    setEscalatingId(doubtId);
    try {
      const response = await fetch("/api/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doubtId }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to escalate doubt.");

      setHistory((prev) =>
        prev.map((d) => (d._id === doubtId ? { ...d, status: "escalated" as const } : d))
      );

      toast.success("🚀 Doubt escalated to a mentor! You'll be notified when they reply.", {
        autoClose: 5000,
      });
    } catch (err) {
      toast.error(`❌ ${err instanceof Error ? err.message : "Failed to escalate."}`);
    } finally {
      setEscalatingId(null);
    }
  };

  /* ── Spinner ─────────────────────────────────────────────────────── */
  const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );

  /* ── Shared feedback + escalate block ───────────────────────────── */
  const FeedbackActions = ({ doubt, compact = false }: { doubt: DoubtDetail; compact?: boolean }) => {
    const existingFeedback = doubt.feedback && doubt.feedback.length > 0
      ? doubt.feedback[doubt.feedback.length - 1].isHelpful
      : null;
    const isEscalated = doubt.status === "escalated" || doubt.status === "mentor_replied";

    return (
      <div className={`space-y-2.5 ${compact ? "mt-3" : "mt-4"}`}>
        {/* Feedback row */}
        <div className="flex flex-wrap items-center gap-2">
          {existingFeedback !== null ? (
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${compact ? "text-xs" : "text-sm"} font-semibold ${existingFeedback
                  ? "border-brand-success/50 bg-brand-success/10 text-brand-success"
                  : "border-brand-accent/50 bg-brand-accent/10 text-brand-accent"
                }`}
            >
              {existingFeedback ? (
                <>
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  Marked as Helpful
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                  </svg>
                  Marked as Not Helpful
                </>
              )}
            </div>
          ) : (
            <>
              <span className={`${compact ? "text-xs" : "text-xs"} text-brand-neutral/50`}>
                Was this helpful?
              </span>
              <button
                onClick={() => void submitFeedback(doubt._id, true)}
                disabled={feedbackLoadingId === doubt._id}
                className={`font-display inline-flex items-center gap-1.5 rounded-full border border-brand-success/40 font-medium text-brand-success transition-colors duration-150 hover:bg-brand-success/10 disabled:cursor-not-allowed disabled:opacity-50 ${compact ? "px-3 py-1 text-xs" : "px-3.5 py-1.5 text-xs"}`}
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                Helpful
              </button>
              <button
                onClick={() => void submitFeedback(doubt._id, false)}
                disabled={feedbackLoadingId === doubt._id}
                className={`font-display inline-flex items-center gap-1.5 rounded-full border border-brand-border font-medium text-brand-neutral/70 transition-colors duration-150 hover:border-brand-accent/40 hover:text-brand-accent disabled:cursor-not-allowed disabled:opacity-50 ${compact ? "px-3 py-1 text-xs" : "px-3.5 py-1.5 text-xs"}`}
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                </svg>
                Not helpful
              </button>
            </>
          )}
        </div>

        {/* Escalate row */}
        <div>
          <button
            onClick={() => void escalate(doubt._id)}
            disabled={escalatingId === doubt._id || isEscalated}
            className={`font-display inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${compact ? "px-3 py-1 text-xs" : "px-3.5 py-1.5 text-xs"} ${isEscalated
                ? "border-brand-link/20 text-brand-link/50"
                : "border-brand-link/40 text-brand-link hover:bg-brand-link/10"
              }`}
          >
            {isEscalated ? "🚀 Escalated to mentor" : escalatingId === doubt._id ? "⏳ Escalating..." : "🚀 Escalate to mentor"}
          </button>
        </div>
      </div>
    );
  };

  /* ── Render Chat Item ───────────────────────────────────────────── */
  const ChatItem = ({ doubt, compact = false }: { doubt: DoubtDetail; compact?: boolean }) => (
    <div className="space-y-3 mb-6">
      {/* Question recap */}
      <div className="rounded-xl border border-brand-border bg-brand-bg p-4">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <p className="font-display text-xs font-semibold uppercase tracking-wider text-brand-link">
            Student
          </p>
          <span className="text-xs text-brand-neutral/50">
            {new Date(doubt.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="mt-1.5 text-sm font-medium text-brand-text">
          {doubt.title || "Untitled Doubt"}
        </p>
        <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-brand-neutral/70">
          {doubt.description}
        </p>
      </div>

      {/* AI answer or Mentor reply */}
      {doubt.aiResponse ? (
        <div className="rounded-xl border border-brand-accent/25 bg-brand-accent/8 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-xs font-semibold uppercase tracking-wider text-brand-accent">
              AI Tutor
            </p>
            <span className="rounded-full border border-brand-success/30 bg-brand-success/10 px-2.5 py-0.5 text-xs font-semibold text-brand-success">
              {(doubt.aiResponse.confidenceScore).toFixed(1)}% confidence
            </span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-brand-neutral/90">
            {doubt.aiResponse.answer}
          </p>

          {/* Feedback + escalate — inline in AI answer card */}
          <div className="mt-4 border-t border-brand-accent/20 pt-3">
            <FeedbackActions doubt={doubt} compact={compact} />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-brand-border bg-brand-surface p-4 flex justify-center">
          <div className="flex items-center gap-2 text-sm text-brand-neutral/70"><Spinner /> Generating AI response...</div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            router.push(`/doubts/${doubt._id}` as Route);
            onClose?.();
          }}
          className="font-display rounded-full border border-brand-link/40 px-4 py-2 text-xs font-medium text-brand-link transition-all duration-150 hover:bg-brand-link/10"
        >
          Open full thread →
        </button>
      </div>

      {/* Recommendations — collapsible */}
      {doubt.aiResponse && doubt.aiResponse.recommendedResources.length > 0 ? (
        <details className="rounded-xl border border-brand-border bg-brand-bg">
          <summary className="cursor-pointer select-none px-4 py-3 text-xs font-semibold text-brand-neutral/70">
            📚 {doubt.aiResponse.recommendedResources.length} Recommended
            Resources
          </summary>
          <div className="border-t border-brand-border px-4 pb-4 pt-3">
            <RecommendationList
              resources={doubt.aiResponse.recommendedResources}
              title=""
            />
          </div>
        </details>
      ) : null}
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════
     WIDGET mode — compact single-column
  ════════════════════════════════════════════════════════════════════ */
  if (mode === "widget") {
    return (
      <div className="flex flex-col gap-4">
        {/* Result List */}
        <div className="space-y-4">
          {historyLoading ? (
            <div className="flex justify-center p-6"><Spinner /></div>
          ) : history.length > 0 ? (
            history.map((doubt) => <ChatItem key={doubt._id} doubt={doubt} compact={true} />)
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-brand-border bg-brand-bg px-4 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-accent/25 bg-brand-accent/8 text-2xl">
                💬
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-brand-text">
                  No previous doubts
                </p>
                <p className="mt-1 text-xs text-brand-neutral/60">
                  Ask your first doubt below!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Input card */}
        <div className="rounded-xl border border-brand-border bg-brand-bg p-4 shadow-panel">
          {user ? (
            <p className="mb-3 text-xs text-brand-neutral/60">
              Signed in as{" "}
              <span className="font-medium text-brand-text">{user.name}</span>
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="widget-description"
                className="mb-1 block text-xs font-medium text-brand-neutral/80"
              >
                Ask your doubt
              </label>
              <textarea
                id="widget-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you stuck on? Be as detailed as possible."
                className="w-full !min-h-32 !rounded-xl !py-2 !text-sm"
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
        <div ref={bottomRef} />
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════
     PAGE mode — vertical layout with bottom input
  ════════════════════════════════════════════════════════════════════ */
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* History Area */}
      <section className="space-y-6">
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-panel">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand-link/30 bg-brand-link/10">
              <span className="font-display text-xs font-bold text-brand-link">AI</span>
            </div>
            <div>
              <p className="text-xs text-brand-neutral/60">Tutor response</p>
              <h3 className="font-display text-lg font-semibold text-brand-text">
                Chat History
              </h3>
            </div>
          </div>

          <div className="space-y-8">
            {historyLoading ? (
              <div className="flex justify-center p-6"><Spinner /></div>
            ) : history.length > 0 ? (
              history.map((doubt) => <ChatItem key={doubt._id} doubt={doubt} />)
            ) : (
              <p className="text-sm leading-7 text-brand-neutral/60 text-center py-10">
                No previous doubts yet. Start the conversation below!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Bottom — input */}
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
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-brand-neutral/80"
              >
                What is your doubt?
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Explain what you're trying to achieve, what you've tried, and exactly where you're getting stuck. The more detail you provide, the better the AI can help!"
                className="!min-h-56"
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
      <div ref={bottomRef} />
    </div>
  );
}
