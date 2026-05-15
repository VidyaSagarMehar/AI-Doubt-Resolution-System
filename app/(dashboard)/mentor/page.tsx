"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { DoubtDetail } from "@/types";
import { formatDate } from "@/lib/utils";

export default function MentorPage() {
  const [doubts, setDoubts] = useState<DoubtDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEscalatedDoubts = async () => {
      try {
        const response = await fetch("/api/doubts?status=escalated");
        const payload = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = "/login";
            return;
          }

          if (response.status === 403) {
            window.location.href = "/ask";
            return;
          }
          throw new Error(payload.error ?? "Failed to load escalated doubts.");
        }

        setDoubts(payload.data ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load escalated doubts.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadEscalatedDoubts();
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
          Mentor Workspace
        </p>
        <h2 className="font-display mt-2 text-3xl font-bold text-brand-text">
          Escalated doubts needing support
        </h2>
      </div>

      {loading ? (
        <StateCard>
          <p className="text-brand-neutral/70">Loading mentor queue...</p>
        </StateCard>
      ) : error ? (
        <StateCard>
          <p className="text-brand-accent">{error}</p>
        </StateCard>
      ) : doubts.length === 0 ? (
        <StateCard>
          <p className="text-brand-neutral/70">No escalated doubts right now.</p>
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
    </section>
  );
}
