"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { DoubtDetail } from "@/types";
import { formatDate, getStatusTone } from "@/lib/utils";

export default function DoubtsPage() {
  const [doubts, setDoubts] = useState<DoubtDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDoubts = async () => {
      try {
        const response = await fetch("/api/doubts");
        const payload = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = "/login";
            return;
          }
          throw new Error(payload.error ?? "Failed to load doubts.");
        }

        setDoubts(payload.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load doubts.");
      } finally {
        setLoading(false);
      }
    };

    void loadDoubts();
  }, []);

  const StateCard = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-panel">
      {children}
    </div>
  );

  return (
    <section className="space-y-6">
      <div>
        <p className="font-display text-xs font-semibold uppercase tracking-[0.32em] text-brand-accent">
          Doubt History
        </p>
        <h2 className="font-display mt-2 text-3xl font-bold text-brand-text">
          Your submitted doubts
        </h2>
      </div>

      {loading ? (
        <StateCard>
          <p className="text-brand-neutral/70">Loading your doubts...</p>
        </StateCard>
      ) : error ? (
        <StateCard>
          <p className="text-brand-accent">{error}</p>
        </StateCard>
      ) : doubts.length === 0 ? (
        <StateCard>
          <p className="text-brand-neutral/70">No doubts submitted yet.</p>
        </StateCard>
      ) : (
        <div className="grid gap-3">
          {doubts.map((doubt) => (
            <Link
              key={doubt._id}
              href={`/doubts/${doubt._id}` as Route}
              className="block rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-panel transition-all duration-150 hover:border-brand-accent/30 hover:-translate-y-0.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <h3 className="font-display text-base font-semibold text-brand-text">
                    {doubt.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-brand-neutral/70">
                    {doubt.description}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusTone(doubt.status)}`}
                >
                  {doubt.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-brand-neutral/50">
                <span>{formatDate(doubt.createdAt)}</span>
                {doubt.aiResponse?.confidenceScore !== undefined ? (
                  <span>
                    Confidence: {(doubt.aiResponse.confidenceScore * 100).toFixed(1)}%
                  </span>
                ) : (
                  <span>No AI answer yet</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
