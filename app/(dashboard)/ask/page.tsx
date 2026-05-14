import { ChatUI } from "@/components/ChatUI";

export default function AskPage() {
  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sea">
          Student Workspace
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-ink">
          Ask a doubt and get a grounded AI answer
        </h2>
        <p className="mt-3 text-slate-600">
          Submit a question, run retrieval against your learning resources, and
          review the answer, confidence, recommendations, feedback, and mentor
          escalation in one flow.
        </p>
      </div>
      <ChatUI />
    </section>
  );
}
