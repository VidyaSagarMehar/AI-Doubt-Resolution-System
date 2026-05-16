'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

const studentNavItems = [
	{ href: '/ask' as Route, label: 'Ask Doubt' },
	{ href: '/doubts' as Route, label: 'My Doubts' },
];

const mentorNavItems = [
	{ href: '/mentor' as Route, label: 'Mentor Queue' },
	{ href: '/admin/ingest' as Route, label: 'Knowledge Ingestion' },
];

export function DashboardHeader() {
	const router = useRouter();
	const { user, logout, loading } = useAuth();

	const handleLogout = async () => {
		await logout();
		router.push('/login');
		router.refresh();
	};

	return (
		<header className="sticky top-0 z-40 border-b border-brand-border bg-brand-bg/95 backdrop-blur-sm">
			<div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
				{/* Logo */}
				<div className="flex flex-col items-center justify-center">
					<span className="font-display text-2xl font-semibold lowercase tracking-[0.2em] text-brand">
						House of EdTech
					</span>
					<h1 className="mt-0.5 font-display text-xs font-extralight uppercase tracking-[0.2em] text-brand-text">
						Doubt Resolution Hub
					</h1>
				</div>

				{/* Right Section */}
				<div className="flex flex-wrap items-center gap-3 sm:gap-4">
					{/* Nav links */}
					<nav className="flex flex-wrap gap-1">
						{studentNavItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="font-display rounded-lg px-4 py-2 text-sm font-medium text-brand-text/80 transition-all duration-150 hover:bg-brand-surface hover:text-brand-link"
							>
								{item.label}
							</Link>
						))}

						{user?.role === 'mentor' &&
							mentorNavItems.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className="font-display rounded-lg px-4 py-2 text-sm font-medium text-brand-text/80 transition-all duration-150 hover:bg-brand-surface hover:text-brand-link"
								>
									{item.label}
								</Link>
							))}
					</nav>

					{/* User Profile Chip (Improved UI) */}
					<div className="flex items-center gap-3 rounded-xl border border-brand-border bg-brand-surface px-4 py-2 shadow-sm">
						{/* Avatar */}
						<div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-accent/20 text-sm font-semibold text-brand-accent">
							{loading ? '...' : (user?.name?.charAt(0)?.toUpperCase() ?? 'U')}
						</div>

						{/* Name + Role */}
						<div className="flex flex-col leading-tight">
							<p className="font-display text-sm font-semibold text-brand-text">
								{loading ? 'Loading...' : (user?.name ?? 'Unknown user')}
							</p>
							<p className="text-[10px] uppercase tracking-wide text-brand-neutral/60">
								{user?.role ?? 'guest'}
							</p>
						</div>
					</div>

					{/* Logout */}
					<button
						onClick={() => void handleLogout()}
						className="font-display rounded-lg border border-brand-border px-4 py-2 text-sm font-medium text-brand-text/80 transition-all duration-150 hover:border-brand-accent hover:text-brand-accent"
					>
						Log out
					</button>
				</div>
			</div>
		</header>
	);
}
