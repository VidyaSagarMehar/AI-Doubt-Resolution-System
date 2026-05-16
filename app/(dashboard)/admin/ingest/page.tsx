"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminIngestPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"text" | "video" | "article" | "documentation">("text");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "mentor")) {
      router.push("/doubts");
    }
  }, [user, authLoading, router]);

  if (authLoading) return <div className="p-10 text-center">Loading authentication...</div>;
  if (!user || user.role !== "mentor") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          url: url || undefined,
          type,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to ingest content.");
      }

      toast.success("✅ Content ingested successfully and synced to Qdrant!");
      setTitle("");
      setContent("");
      setUrl("");
      setTags("");
    } catch (error) {
      toast.error(`❌ Error: ${error instanceof Error ? error.message : "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-text">Knowledge Ingestion</h1>
        <p className="mt-2 text-brand-neutral/60">
          Add new course material, videos, or documentation to the RAG knowledge base.
        </p>
      </div>

      <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-panel">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-neutral/80">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to React Hooks"
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-neutral/80">Resource Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-brand-bg border-brand-border text-brand-text rounded-xl p-2.5 focus:ring-2 focus:ring-brand-accent/50 outline-none"
              >
                <option value="text">Text / Article</option>
                <option value="video">Video Lecture</option>
                <option value="documentation">Official Documentation</option>
                <option value="article">Blog Post</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-neutral/80">External URL (Optional)</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/... or https://docs.example.com"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-neutral/80">Content / Knowledge Chunk</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the educational content or summary here. This is what the AI will use to answer doubts."
              className="w-full min-h-[200px]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-neutral/80">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, frontend, hooks, week-1"
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="font-display w-full rounded-xl bg-brand-accent py-4 text-sm font-semibold text-brand-bg transition-all hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Processing & Embedding..." : "Ingest into Knowledge Base"}
          </button>
        </form>
      </div>

      <div className="mt-8 rounded-xl bg-brand-accent/5 border border-brand-accent/10 p-4">
        <h3 className="text-sm font-semibold text-brand-accent mb-1 flex items-center gap-2">
          <span>💡</span> Pro Tip
        </h3>
        <p className="text-xs text-brand-neutral/60 leading-relaxed">
          For best results, keep each ingestion chunk focused on a single concept. If you have a large document, 
          split it into multiple entries. This makes the semantic search much more accurate!
        </p>
      </div>
    </div>
  );
}
