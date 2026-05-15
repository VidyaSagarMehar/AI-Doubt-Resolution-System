'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

const studentNavItems = [
	{ href: '/ask' as Route, label: 'Ask Doubt' },
	{ href: '/doubts' as Route, label: 'My Doubts' },
];

const mentorNavItem = { href: '/mentor' as Route, label: 'Mentor Queue' };

export function DashboardHeader() {
	const router = useRouter();
	const { user, logout, loading } = useAuth();

	const handleLogout = async () => {
		await logout();
		router.push('/login');
		router.refresh();
	};

	return (
		<header className="border-b border-brand-border bg-brand-bg/95 backdrop-blur-sm sticky top-0 z-40">
			<div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
				{/* Logo */}
				<div className="flex flex-col justify-center items-center">
					<span className="font-display text-2xl font-semibold lowercase tracking-[0.2em] text-brand">
						House of EdTech
					</span>
					<h1 className="font-display text-xs uppercase font-extralight text-brand-text mt-0.5 tracking-[0.2em]">
						Doubt Resolution Hub
					</h1>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					{/* Nav links */}
					<nav className="flex flex-wrap gap-1">
						{studentNavItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="font-display rounded-lg px-4 py-2 text-sm font-medium text-brand-text/80 transition-colors duration-150 hover:bg-brand-surface hover:text-brand-link"
							>
								{item.label}
							</Link>
						))}
						{user?.role === 'mentor' ? (
							<Link
								href={mentorNavItem.href}
								className="font-display rounded-lg px-4 py-2 text-sm font-medium text-brand-text/80 transition-colors duration-150 hover:bg-brand-surface hover:text-brand-link"
							>
								{mentorNavItem.label}
							</Link>
						) : null}
					</nav>

					{/* User chip */}
					<div className="rounded-lg border border-brand-border bg-brand-surface px-4 py-2 text-right">
						<p className="font-display text-sm font-semibold text-brand-text">
							{loading ? 'Loading...' : (user?.name ?? 'Unknown user')}
						</p>
						<p className="text-xs uppercase tracking-wide text-brand-neutral/60">
							{user?.role ?? 'guest'}
						</p>
					</div>

					{/* Log out */}
					<button
						onClick={() => void handleLogout()}
						className="font-display rounded-lg border border-brand-border px-4 py-2 text-sm font-medium text-brand-text/80 transition-colors duration-150 hover:border-brand-accent hover:text-brand-accent"
					>
						Log out
					</button>
				</div>
			</div>
		</header>
	);
}
