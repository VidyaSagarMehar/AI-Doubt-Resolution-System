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
    <div className="w-full max-w-md rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-card">
      {/* Eyebrow */}
      <p className="font-display text-xs font-semibold uppercase tracking-[0.32em] text-brand-accent">
        {isSignup ? "Create Account" : "Welcome Back"}
      </p>

      {/* Heading */}
      <h1 className="font-display mt-2 text-3xl font-bold text-brand-text">
        {isSignup ? "Join the learning hub" : "Log in to continue"}
      </h1>

      {/* Description */}
      <p className="mt-3 text-sm leading-6 text-brand-neutral/70">
        {isSignup
          ? "Create a student or mentor account to use the doubt resolution workflow."
          : "Access your doubts, AI answers, and mentor workflow securely."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {/* Name */}
        {isSignup ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-neutral/80" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Jane Doe"
              required
            />
          </div>
        ) : null}

        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-neutral/80" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-neutral/80" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Min. 8 characters"
            required
            minLength={8}
          />
        </div>

        {/* Role */}
        {isSignup ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-neutral/80" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
            >
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>
        ) : null}

        {/* Error */}
        {error ? (
          <p className="rounded-lg border border-brand-accent/30 bg-brand-accent/10 px-4 py-2.5 text-sm text-brand-accent">
            {error}
          </p>
        ) : null}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="font-display w-full rounded-xl bg-brand-accent px-5 py-3 text-sm font-semibold text-brand-bg transition-all duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
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

      <p className="mt-6 text-sm text-brand-neutral/60">
        {isSignup ? "Already have an account?" : "Need an account?"}{" "}
        <Link
          href={isSignup ? ("/login" as Route) : ("/signup" as Route)}
          className="font-medium text-brand-link underline-offset-2 hover:underline"
        >
          {isSignup ? "Log in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}
