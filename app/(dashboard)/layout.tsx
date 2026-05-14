import type { Route } from "next";
import Link from "next/link";

const navItems = [
  { href: "/ask" as Route, label: "Ask Doubt" },
  { href: "/doubts" as Route, label: "My Doubts" },
  { href: "/mentor" as Route, label: "Mentor Queue" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sea">
              House of EdTech
            </p>
            <h1 className="text-xl font-semibold text-ink">Doubt Resolution Hub</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-sea hover:text-sea"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
