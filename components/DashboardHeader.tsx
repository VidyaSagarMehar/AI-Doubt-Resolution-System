"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

const studentNavItems = [
  { href: "/ask" as Route, label: "Ask Doubt" },
  { href: "/doubts" as Route, label: "My Doubts" },
];

const mentorNavItem = { href: "/mentor" as Route, label: "Mentor Queue" };

export function DashboardHeader() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sea">
            House of EdTech
          </p>
          <h1 className="text-xl font-semibold text-ink">Doubt Resolution Hub</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex flex-wrap gap-2">
            {studentNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-sea hover:text-sea"
              >
                {item.label}
              </Link>
            ))}
            {user?.role === "mentor" ? (
              <Link
                href={mentorNavItem.href}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-sea hover:text-sea"
              >
                {mentorNavItem.label}
              </Link>
            ) : null}
          </nav>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right">
            <p className="text-sm font-semibold text-ink">
              {loading ? "Loading..." : user?.name ?? "Unknown user"}
            </p>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {user?.role ?? "guest"}
            </p>
          </div>

          <button
            onClick={() => void handleLogout()}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
