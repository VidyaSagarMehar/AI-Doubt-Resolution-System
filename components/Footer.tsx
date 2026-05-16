import React from 'react';

export function Footer() {
  return (
    <footer className="w-full border-t border-brand-border bg-brand-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-8 lg:flex-row lg:px-8">
        <div className="text-center lg:text-left">
          <h2 className="font-display text-lg font-semibold tracking-tight text-brand-text">
            House of <span className="text-brand-accent">EdTech</span>
          </h2>

          <p className="mt-1 max-w-md text-sm text-brand-neutral/60">
            AI-powered doubt resolution for modern learners.
          </p>
        </div>

        {/* Socials */}
        <div className="flex flex-col items-center gap-3 lg:items-end">
          <p className="text-sm font-medium text-brand-text/90">
            Created by Vidya Sagar Mehar
          </p>

          <div className="flex items-center gap-3">
            {/* GitHub */}
            <a
              href="https://github.com/vidyaSagarMehar/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="rounded-full border border-brand-border bg-brand-surface/80 p-2 text-brand-neutral/70 transition-all duration-200 hover:border-brand-accent/40 hover:text-brand-accent"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.173c-3.338.725-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.084 1.839 1.236 1.839 1.236 1.07 1.834 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.604-2.665-.304-5.466-1.333-5.466-5.93 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.49 11.49 0 013.003-.404c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.431.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.565 21.798 24 17.302 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/vidyasagarmehar/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="rounded-full border border-brand-border bg-brand-surface/80 p-2 text-brand-neutral/70 transition-all duration-200 hover:border-brand-accent/40 hover:text-brand-accent"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0H5C2.239 0 0 2.239 0 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5V5c0-2.761-2.239-5-5-5zM8 19H5V9h3v10zM6.5 7.732A1.768 1.768 0 116.5 4.2a1.768 1.768 0 010 3.532zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V9h3v1.765c1.396-2.586 7-2.777 7 2.476V19z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-brand-border/40">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <p className="text-center text-xs text-brand-neutral/40">
            © {new Date().getFullYear()} House of EdTech · Built with Next.js,
            MongoDB, Qdrant & OpenAI
          </p>
        </div>
      </div>
    </footer>
  );
}