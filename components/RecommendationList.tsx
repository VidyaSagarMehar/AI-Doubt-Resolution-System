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
    <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-panel">
      <h3 className="text-xl font-semibold text-ink">{title}</h3>
      {resources.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">
          No semantic matches yet. Add content records and embeddings to Qdrant to
          power recommendations.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {resources.map((resource) => (
            <article
              key={resource.embeddingId}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-semibold text-ink">{resource.title}</h4>
                <span className="rounded-full bg-sea/10 px-3 py-1 text-xs font-semibold text-sea">
                  {(resource.score * 100).toFixed(1)}%
                </span>
              </div>
              <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-600">
                {resource.content}
              </p>
              {resource.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span
                      key={`${resource.embeddingId}-${tag}`}
                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600"
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
