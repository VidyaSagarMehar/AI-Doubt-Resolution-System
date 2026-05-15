"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RecommendationList } from "@/components/RecommendationList";
import { useAuth } from "@/components/providers/AuthProvider";
import type { DoubtDetail } from "@/types";
import { formatDate, getStatusTone } from "@/lib/utils";

export default function DoubtDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [doubt, setDoubt] = useState<DoubtDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    const loadDoubt = async () => {
      try {
        const response = await fetch(`/api/doubts/${params.id}`);
        const payload = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = "/login";
            return;
          }

          if (response.status === 403) {
            window.location.href = "/doubts";
            return;
          }

          throw new Error(payload.error ?? "Failed to load doubt.");
        }

        setDoubt(payload.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load doubt.");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      void loadDoubt();
    }
  }, [params.id]);

  const submitFeedback = async (isHelpful: boolean) => {
    if (!doubt) {
      return;
    }

    setFeedbackLoading(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doubtId: doubt._id, isHelpful }),
      });
      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (response.status === 403) {
          window.location.href = "/doubts";
          return;
        }

        throw new Error(payload.error ?? "Failed to submit feedback.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const escalate = async () => {
    if (!doubt) {
      return;
    }

    setEscalating(true);
    try {
      const response = await fetch("/api/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doubtId: doubt._id }),
      });
      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (response.status === 403) {
          window.location.href = "/doubts";
          return;
        }

        throw new Error(payload.error ?? "Failed to escalate doubt.");
      }

      setDoubt(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to escalate doubt.");
    } finally {
      setEscalating(false);
    }
  };

  const submitMentorReply = async () => {
    if (!doubt || !replyMessage.trim()) {
      return;
    }

    setReplying(true);
    try {
      const response = await fetch("/api/mentor/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doubtId: doubt._id,
          message: replyMessage,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (response.status === 403) {
          window.location.href = "/mentor";
          return;
        }

        throw new Error(payload.error ?? "Failed to send mentor reply.");
      }

      setDoubt(payload.data);
      setReplyMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send mentor reply.");
    } finally {
      setReplying(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-panel">
        <p className="text-slate-600">Loading doubt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-coral/20 bg-white p-8 shadow-panel">
        <p className="text-coral">{error}</p>
      </div>
    );
  }

  if (!doubt) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-panel">
        <p className="text-slate-600">Doubt not found.</p>
      </div>
    );
  }

  const isMentor = user?.role === "mentor";
  const hasMentorReplies = (doubt.mentorReplies?.length ?? 0) > 0;

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sea">
              Doubt Detail
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-ink">{doubt.title}</h2>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusTone(
              doubt.status,
            )}`}
          >
            {doubt.status.replace("_", " ")}
          </span>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-slate-700">{doubt.description}</p>
        <p className="mt-4 text-xs text-slate-500">{formatDate(doubt.createdAt)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold text-ink">AI Answer</h3>
              {doubt.aiResponse?.confidenceScore !== undefined ? (
                <span className="rounded-full bg-sea/10 px-3 py-1 text-xs font-semibold text-sea">
                  Confidence {(doubt.aiResponse.confidenceScore * 100).toFixed(1)}%
                </span>
              ) : null}
            </div>

            {doubt.aiResponse ? (
              <>
                <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-700">
                  {doubt.aiResponse.answer}
                </p>

                {!isMentor ? (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => void submitFeedback(true)}
                      disabled={feedbackLoading}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-sea hover:text-sea disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Helpful
                    </button>
                    <button
                      onClick={() => void submitFeedback(false)}
                      disabled={feedbackLoading}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-coral hover:text-coral disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Not helpful
                    </button>
                    <button
                      onClick={() => void escalate()}
                      disabled={escalating || doubt.status === "escalated" || doubt.status === "mentor_replied"}
                      className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {doubt.status === "mentor_replied"
                        ? "Mentor replied"
                        : doubt.status === "escalated"
                          ? "Escalated to mentor"
                          : escalating
                            ? "Escalating..."
                            : "Escalate to mentor"}
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="mt-4 text-slate-600">No AI response stored for this doubt yet.</p>
            )}
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold text-ink">Mentor Conversation</h3>
              {hasMentorReplies ? (
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                  {doubt.mentorReplies?.length} repl{doubt.mentorReplies?.length === 1 ? "y" : "ies"}
                </span>
              ) : null}
            </div>

            {hasMentorReplies ? (
              <div className="mt-4 space-y-4">
                {doubt.mentorReplies?.map((reply) => (
                  <div
                    key={reply._id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">{reply.mentorName}</p>
                      <p className="text-xs text-slate-500">
                        {formatDate(reply.createdAt)}
                      </p>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {reply.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-slate-600">
                {isMentor
                  ? "No mentor reply has been sent yet."
                  : "No mentor reply yet. If this doubt has been escalated, the mentor response will appear here."}
              </p>
            )}

            {isMentor ? (
              <div className="mt-6 space-y-3">
                <label
                  htmlFor="mentor-reply"
                  className="block text-sm font-medium text-slate-700"
                >
                  Reply to the student
                </label>
                <textarea
                  id="mentor-reply"
                  value={replyMessage}
                  onChange={(event) => setReplyMessage(event.target.value)}
                  placeholder="Write a clear explanation, next step, or correction for the student."
                  className="min-h-36 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sea focus:bg-white"
                />
                <button
                  onClick={() => void submitMentorReply()}
                  disabled={replying || !replyMessage.trim()}
                  className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {replying ? "Sending reply..." : "Send mentor reply"}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <RecommendationList
          resources={doubt.aiResponse?.recommendedResources ?? []}
          title="Recommended Resources"
        />
      </div>
    </section>
  );
}
