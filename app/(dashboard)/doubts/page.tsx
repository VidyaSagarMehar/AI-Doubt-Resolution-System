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

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sea">
          Doubt History
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-ink">Your submitted doubts</h2>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-panel">
          <p className="text-slate-600">Loading your doubts...</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-coral/20 bg-white p-8 shadow-panel">
          <p className="text-coral">{error}</p>
        </div>
      ) : doubts.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-panel">
          <p className="text-slate-600">No doubts submitted yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {doubts.map((doubt) => (
            <Link
              key={doubt._id}
              href={`/doubts/${doubt._id}` as Route}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel transition-transform hover:-translate-y-0.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-ink">{doubt.title}</h3>
                  <p className="line-clamp-2 text-sm text-slate-600">
                    {doubt.description}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusTone(
                    doubt.status,
                  )}`}
                >
                  {doubt.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
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
