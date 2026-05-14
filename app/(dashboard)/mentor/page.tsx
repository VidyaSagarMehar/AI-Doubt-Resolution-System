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

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sea">
          Mentor Workspace
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-ink">
          Escalated doubts needing support
        </h2>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-panel">
          <p className="text-slate-600">Loading mentor queue...</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-coral/20 bg-white p-8 shadow-panel">
          <p className="text-coral">{error}</p>
        </div>
      ) : doubts.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-panel">
          <p className="text-slate-600">No escalated doubts right now.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {doubts.map((doubt) => (
            <Link
              key={doubt._id}
              href={`/doubts/${doubt._id}` as Route}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{doubt.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                    {doubt.description}
                  </p>
                </div>
                <div className="rounded-full bg-sun/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sun">
                  Escalated
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-500">
                Submitted {formatDate(doubt.createdAt)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
