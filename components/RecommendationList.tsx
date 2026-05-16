import type { RecommendedResource } from "@/types";

type RecommendationListProps = {
  resources: RecommendedResource[];
  title?: string;
};

export function RecommendationList({
  resources,
  title = "Recommended Resources",
}: RecommendationListProps) {
  return (
    <aside className="rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-card">
      {title ? (
        <h3 className="font-display text-lg font-semibold text-brand-text">
          {title}
        </h3>
      ) : null}
      {resources.length === 0 ? (
        <p className="mt-4 text-sm text-brand-neutral/60">
          No semantic matches yet. Add content records and embeddings to Qdrant to
          power recommendations.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {resources.map((resource) => (
            <article
              key={resource.embeddingId}
              className="group rounded-xl border border-brand-border bg-brand-bg p-4 transition-all duration-200 hover:border-brand-accent/40 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-accent/20 bg-brand-accent/5 text-lg transition-transform group-hover:scale-110">
                    {resource.type === "video" || resource.type === "playlist"
                      ? "📺"
                      : resource.type === "course"
                        ? "🎓"
                        : resource.type === "article"
                          ? "📄"
                          : resource.type === "pdf_notes"
                            ? "📓"
                            : resource.type === "documentation"
                              ? "📚"
                              : "📝"}
                  </span>
                  <div className="flex flex-col">
                    <h4 className="font-display font-semibold text-brand-text">
                      {resource.title}
                    </h4>
                    {resource.startTime && (
                      <span className="text-[10px] font-medium text-brand-accent mt-0.5">
                        ⏱️ {resource.startTime} {resource.endTime ? `- ${resource.endTime}` : ""}
                      </span>
                    )}
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-2.5 py-0.5 text-xs font-semibold text-brand-accent">
                  {(resource.score * 100).toFixed(1)}% match
                </span>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-brand-neutral/70">
                {resource.content}
              </p>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span
                      key={`${resource.embeddingId}-${tag}`}
                      className="rounded-full border border-brand-border bg-brand-surface/50 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-brand-neutral/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {resource.url ? (() => {
                  let finalUrl = resource.url;
                  if (resource.startTime && (finalUrl.includes("youtube.com") || finalUrl.includes("youtu.be"))) {
                    // Convert "1:24" to seconds for YT
                    const parts = resource.startTime.split(":");
                    let seconds = 0;
                    if (parts.length === 3) {
                      seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
                    } else if (parts.length === 2) {
                      seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                    }
                    if (seconds > 0) {
                      finalUrl += (finalUrl.includes("?") ? "&" : "?") + `t=${seconds}s`;
                    }
                  }
                  return (
                    <a
                      href={finalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display flex shrink-0 items-center gap-1.5 rounded-lg border border-brand-link/40 px-3 py-1.5 text-xs font-medium text-brand-link transition-colors hover:bg-brand-link/10"
                    >
                      View Resource
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  );
                })() : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </aside>
  );
}
