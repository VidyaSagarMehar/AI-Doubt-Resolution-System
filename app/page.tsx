import Link from "next/link";
import { DashboardHeader } from "@/components/DashboardHeader";
import { getCurrentUserFromCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUserFromCookies();

  return (
    <main className="min-h-screen bg-brand-bg">
      <DashboardHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-24 pb-32 sm:pt-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.brand.accent/15%),transparent)]" />
        
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-base font-semibold leading-7 text-brand-link">
            Modern AI Tutor for EdTech
          </p>
          <h1 className="font-display mt-6 text-4xl font-bold tracking-tight text-brand-text sm:text-6xl">
            Resolve Doubts in <span className="text-brand-accent">Seconds</span>, Not Hours
          </h1>
          <p className="mt-8 text-lg leading-8 text-brand-neutral/70">
            Our RAG-powered AI Tutor understands your course material, video lectures, and documentation to provide context-aware answers instantly.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {user ? (
              <Link
                href="/ask"
                className="font-display rounded-full bg-brand-accent px-8 py-4 text-base font-bold text-brand-bg shadow-sm transition-all hover:scale-105 hover:brightness-110"
              >
                Go to Dashboard <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="font-display rounded-full bg-brand-accent px-8 py-4 text-base font-bold text-brand-bg shadow-sm transition-all hover:scale-105 hover:brightness-110"
                >
                  Start Learning Now
                </Link>
                <Link href="/login" className="font-display text-sm font-semibold leading-6 text-brand-text">
                  Sign in to your account <span aria-hidden="true">→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-panel">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent/10 text-2xl">
              🧠
            </div>
            <h3 className="mt-6 font-display text-xl font-bold text-brand-text">Context-Aware RAG</h3>
            <p className="mt-4 text-sm leading-relaxed text-brand-neutral/60">
              The AI doesn't just guess. It searches through your specific course videos and docs to give accurate, grounded answers.
            </p>
          </div>
          
          <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-panel">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-link/10 text-2xl">
              🚀
            </div>
            <h3 className="mt-6 font-display text-xl font-bold text-brand-text">Instant Escalation</h3>
            <p className="mt-4 text-sm leading-relaxed text-brand-neutral/60">
              Stuck? With one click, escalate your doubt to a human mentor who can see the entire AI conversation history.
            </p>
          </div>

          <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-panel">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-success/10 text-2xl">
              📊
            </div>
            <h3 className="mt-6 font-display text-xl font-bold text-brand-text">Proactive Learning</h3>
            <p className="mt-4 text-sm leading-relaxed text-brand-neutral/60">
              Our system identifies knowledge gaps in the course material automatically, helping mentors keep content up to date.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
