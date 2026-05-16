"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import type { YouTubeMetadata } from "@/services/ingestion.service";
import type { RawChunk } from "@/services/chunking.service";

export default function AdminIngestPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Mode Selection
  const [mode, setMode] = useState<"manual" | "youtube">("youtube");

  // Manual State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"text" | "video" | "article" | "documentation" | "pdf_notes" | "playlist" | "course">("text");
  const [tags, setTags] = useState("");
  
  // YouTube State
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeMetadata, setYoutubeMetadata] = useState<YouTubeMetadata | null>(null);
  const [previewChunks, setPreviewChunks] = useState<RawChunk[]>([]);
  const [rawTranscript, setRawTranscript] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "mentor")) {
      router.push("/doubts");
    }
  }, [user, authLoading, router]);

  if (authLoading) return <div className="p-10 text-center">Loading authentication...</div>;
  if (!user || user.role !== "mentor") return null;

  // --- MANUAL INGESTION ---
  const handleManualSubmit = async (e: React.FormEvent) => {
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

  // --- YOUTUBE PREVIEW ---
  const handleYoutubePreview = async () => {
    if (!youtubeUrl) {
      toast.error("Please enter a YouTube URL");
      return;
    }
    setLoading(true);
    setPreviewChunks([]);
    setYoutubeMetadata(null);

    try {
      const response = await fetch("/api/admin/ingest/youtube/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to preview YouTube video.");

      setYoutubeMetadata(data.data.metadata);
      setPreviewChunks(data.data.chunks);
      setRawTranscript(data.data.rawTranscript);
      toast.success("✅ Transcript fetched and chunked! Please review below.");
    } catch (error) {
      toast.error(`❌ Error: ${error instanceof Error ? error.message : "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  };

  // --- YOUTUBE APPROVE ---
  const handleYoutubeApprove = async () => {
    if (!youtubeMetadata || previewChunks.length === 0) return;
    setLoading(true);

    try {
      const response = await fetch("/api/admin/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: youtubeMetadata.title,
          content: rawTranscript, // Save raw in mongo
          url: youtubeMetadata.videoId ? `https://youtube.com/watch?v=${youtubeMetadata.videoId}` : youtubeUrl,
          type: "video",
          tags: ["youtube", youtubeMetadata.channelName.replace(/\s+/g, "").toLowerCase()],
          youtubeMetadata: youtubeMetadata,
          preChunkedData: previewChunks,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to embed YouTube content.");

      toast.success("✅ YouTube video embedded and stored successfully!");
      setYoutubeUrl("");
      setYoutubeMetadata(null);
      setPreviewChunks([]);
    } catch (error) {
      toast.error(`❌ Error: ${error instanceof Error ? error.message : "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-text">Knowledge Ingestion</h1>
        <p className="mt-2 text-brand-neutral/60">
          Add new course material to the RAG knowledge base.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setMode("youtube")}
          className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
            mode === "youtube" ? "bg-brand-accent text-brand-bg shadow-sm" : "bg-brand-surface border border-brand-border text-brand-neutral hover:border-brand-accent/30"
          }`}
        >
          YouTube Auto-Ingest
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
            mode === "manual" ? "bg-brand-accent text-brand-bg shadow-sm" : "bg-brand-surface border border-brand-border text-brand-neutral hover:border-brand-accent/30"
          }`}
        >
          Manual Entry
        </button>
      </div>

      <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-panel">
        
        {mode === "youtube" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-neutral/80">YouTube URL</label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full"
                  disabled={loading || previewChunks.length > 0}
                />
                {!previewChunks.length && (
                  <button
                    onClick={handleYoutubePreview}
                    disabled={loading || !youtubeUrl}
                    className="shrink-0 bg-brand-link px-6 rounded-xl text-sm font-semibold text-brand-bg hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    {loading ? "Fetching..." : "Fetch & Analyze"}
                  </button>
                )}
                {previewChunks.length > 0 && (
                  <button
                    onClick={() => {
                      setPreviewChunks([]);
                      setYoutubeMetadata(null);
                    }}
                    className="shrink-0 bg-brand-border px-6 rounded-xl text-sm font-semibold text-brand-text hover:bg-brand-border/80 transition-all"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Preview Section */}
            {youtubeMetadata && previewChunks.length > 0 && (
              <div className="mt-8 pt-6 border-t border-brand-border space-y-6">
                <div className="flex gap-6 items-start bg-brand-bg p-4 rounded-xl border border-brand-border/50">
                  {youtubeMetadata.thumbnailUrl && (
                    <img src={youtubeMetadata.thumbnailUrl} alt="Thumbnail" className="w-48 rounded-lg shadow-sm" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-brand-text">{youtubeMetadata.title}</h3>
                    <p className="text-sm text-brand-neutral/60 mt-1">{youtubeMetadata.channelName}</p>
                    <div className="mt-3 inline-block bg-brand-accent/10 border border-brand-accent/20 px-3 py-1 rounded-full text-xs font-semibold text-brand-accent">
                      {previewChunks.length} Semantic Chunks Detected
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <h4 className="text-sm font-bold text-brand-neutral uppercase tracking-widest mb-3">Chunk Preview</h4>
                  {previewChunks.map((chunk, idx) => (
                    <div key={idx} className="bg-brand-bg border border-brand-border p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-brand-link uppercase tracking-wider">{chunk.topic}</span>
                        {chunk.startTime && (
                          <span className="text-xs font-mono text-brand-neutral/60 bg-brand-surface px-2 py-1 rounded-md">
                            {chunk.startTime} {chunk.endTime ? `- ${chunk.endTime}` : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-brand-neutral/80 leading-relaxed">{chunk.text}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleYoutubeApprove}
                  disabled={loading}
                  className="w-full bg-brand-success py-4 rounded-xl text-brand-bg font-bold shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {loading ? "Generating Vectors & Storing..." : "Approve & Embed"}
                </button>
              </div>
            )}
          </div>
        )}

        {mode === "manual" && (
          <form onSubmit={handleManualSubmit} className="space-y-6">
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
                  <option value="video">Video Lecture / Transcript</option>
                  <option value="documentation">Official Documentation</option>
                  <option value="article">Blog Post</option>
                  <option value="pdf_notes">PDF Notes</option>
                  <option value="playlist">Video Playlist</option>
                  <option value="course">Full Course Material</option>
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
        )}
      </div>
    </div>
  );
}
