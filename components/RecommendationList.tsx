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
              className="rounded-xl border border-brand-border bg-brand-bg p-4 transition-colors duration-150 hover:border-brand-accent/30"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-display font-semibold text-brand-text">
                  {resource.title}
                </h4>
                <span className="shrink-0 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-2.5 py-0.5 text-xs font-semibold text-brand-accent">
                  {(resource.score * 100).toFixed(1)}%
                </span>
              </div>
              <p className="mt-2 line-clamp-4 text-sm leading-6 text-brand-neutral/70">
                {resource.content}
              </p>
              {resource.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span
                      key={`${resource.embeddingId}-${tag}`}
                      className="rounded-full border border-brand-border px-2.5 py-0.5 text-xs text-brand-neutral/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </aside>
  );
}
