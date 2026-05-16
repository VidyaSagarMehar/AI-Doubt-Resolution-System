"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { DoubtDetail } from "@/types";
import { formatDate } from "@/lib/utils";

export default function MentorPage() {
  const [gaps, setGaps] = useState<(DoubtDetail & { confidence?: number })[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    resolvedByAI: number;
    escalated: number;
    mentorReplied: number;
    aiSuccessRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doubts, setDoubts] = useState<DoubtDetail[]>([]);

  useEffect(() => {
    const loadMentorData = async () => {
      try {
        const [doubtsRes, statsRes, gapsRes] = await Promise.all([
          fetch("/api/doubts?status=escalated&allStudents=true"),
          fetch("/api/mentor/stats"),
          fetch("/api/mentor/gaps"),
        ]);

        const doubtsPayload = await doubtsRes.json();
        const statsPayload = await statsRes.json();
        const gapsPayload = await gapsRes.json();

        if (!doubtsRes.ok || !statsRes.ok || !gapsRes.ok) {
          throw new Error("Failed to load mentor data.");
        }

        setDoubts(doubtsPayload.data ?? []);
        setStats(statsPayload.data ?? null);
        setGaps(gapsPayload.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load mentor data.");
      } finally {
        setLoading(false);
      }
    };

    void loadMentorData();
  }, []);

  const StateCard = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-panel">
      {children}
    </div>
  );

  return (
    <section className="space-y-6">
      {/* Stats Overview */}
      {!loading && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-neutral/50">Total Doubts</p>
            <p className="mt-2 text-2xl font-bold text-brand-text">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-success/70">AI Resolution Rate</p>
            <p className="mt-2 text-2xl font-bold text-brand-success">{stats.aiSuccessRate}%</p>
          </div>
          <div className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-accent/70">Escalated (Pending)</p>
            <p className="mt-2 text-2xl font-bold text-brand-accent">{stats.escalated}</p>
          </div>
          <div className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-panel">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-link/70">Mentor Handled</p>
            <p className="mt-2 text-2xl font-bold text-brand-link">{stats.mentorReplied}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.32em] text-brand-accent">
              Support Queue
            </p>
            <h2 className="font-display mt-2 text-2xl font-bold text-brand-text">
              Escalated doubts needing support
            </h2>
          </div>

          {doubts.length === 0 ? (
            <StateCard>
              <p className="text-brand-neutral/70 text-sm">No escalated doubts right now.</p>
            </StateCard>
          ) : (
            <div className="grid gap-3">
              {doubts.map((doubt) => (
                <Link
                  key={doubt._id}
                  href={`/doubts/${doubt._id}` as Route}
                  className="block rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-panel transition-all duration-150 hover:border-brand-accent/30 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-base font-semibold text-brand-text">
                        {doubt.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-3 text-sm text-brand-neutral/70">
                        {doubt.description}
                      </p>
                    </div>
                    <div className="shrink-0 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-accent">
                      Escalated
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-brand-neutral/50">
                    Submitted {formatDate(doubt.createdAt)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Gaps */}
        <aside className="space-y-6">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.32em] text-brand-link">
              Knowledge Gaps
            </p>
            <h2 className="font-display mt-2 text-2xl font-bold text-brand-text">
              Low Confidence
            </h2>
          </div>

          {gaps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-border p-6 text-center">
              <p className="text-xs text-brand-neutral/50">No major gaps identified. AI is performing well!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-brand-neutral/60 leading-relaxed mb-4">
                The AI struggled with these doubts. Consider adding new content to the Knowledge Base to cover these topics.
              </p>
              {gaps.map((gap) => (
                <Link
                  key={gap._id}
                  href={`/doubts/${gap._id}` as Route}
                  className="block rounded-xl border border-brand-border bg-brand-surface p-4 transition-all hover:border-brand-link/40"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-link">
                      {gap.confidence ? `${gap.confidence}% match` : "No match"}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-brand-text line-clamp-1">{gap.title}</h4>
                  <p className="mt-1 text-xs text-brand-neutral/60 line-clamp-2">{gap.description}</p>
                </Link>
              ))}
              <Link
                href="/admin/ingest"
                className="mt-4 block text-center rounded-xl border border-brand-link/40 bg-brand-link/5 p-3 text-xs font-semibold text-brand-link hover:bg-brand-link/10 transition-colors"
              >
                Go to Ingestion Dash →
              </Link>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
