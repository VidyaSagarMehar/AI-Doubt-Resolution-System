"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import type { UserRole } from "@/types";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";
  const redirectPath = (searchParams.get("redirect") || "/ask") as Route;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(
          isSignup ? { name, email, password, role } : { email, password },
        ),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? `Failed to ${mode}.`);
      }

      await refreshUser();
      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${mode}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-panel">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sea">
        {isSignup ? "Create Account" : "Welcome Back"}
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">
        {isSignup ? "Join the learning hub" : "Log in to continue"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {isSignup
          ? "Create a student or mentor account to use the doubt resolution workflow."
          : "Access your doubts, AI answers, and mentor workflow securely."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {isSignup ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sea focus:bg-white"
              required
            />
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sea focus:bg-white"
            required
          />
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-700"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sea focus:bg-white"
            required
            minLength={8}
          />
        </div>

        {isSignup ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sea focus:bg-white"
            >
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>
        ) : null}

        {error ? <p className="text-sm text-coral">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? isSignup
              ? "Creating account..."
              : "Logging in..."
            : isSignup
              ? "Create account"
              : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        {isSignup ? "Already have an account?" : "Need an account?"}{" "}
        <Link
          href={isSignup ? ("/login" as Route) : ("/signup" as Route)}
          className="font-semibold text-sea hover:text-ink"
        >
          {isSignup ? "Log in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}
