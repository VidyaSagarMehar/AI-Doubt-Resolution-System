'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { useChatWidget } from '@/components/providers/ChatWidgetProvider';

// Lazy-load the heavy chat panel — only bundled on first click
const ChatWidget = dynamic(
	() => import('@/components/ChatWidget').then((mod) => mod.ChatWidget),
	{ ssr: false },
);

export function ChatLauncher() {
	const router = useRouter();
	const { user, loading } = useAuth();
	const { isOpen, toggleWidget, closeWidget } = useChatWidget();

	const handleClick = () => {
		if (loading) return;

		if (!user) {
			router.push('/login');
			return;
		}

		toggleWidget();
	};

	return (
		<>
			{/* Lazy-rendered chat panel */}
			<ChatWidget isOpen={isOpen} onClose={closeWidget} />

			{/* Floating trigger */}
			<button
				id="chat-launcher-btn"
				onClick={handleClick}
				aria-label={isOpen ? 'Close AI Tutor chat' : 'Open AI Tutor chat'}
				className="group fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-brand-text/30 bg-brand-text shadow-card transition-all duration-300 hover:brightness-110 hover:-translate-y-1 active:scale-95 sm:right-6"
			>
				{/* Chat bubble icon (idle) */}
				<span
					className={`absolute transition-all duration-200 ${
						isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
					}`}
				>
					<svg
						className="h-6 w-6 text-brand-bg"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
						/>
					</svg>
				</span>

				{/* Close icon (open state) */}
				<span
					className={`absolute transition-all duration-200 ${
						isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
					}`}
				>
					<svg
						className="h-5 w-5 text-brand-bg"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</span>

				{/* Subtle pulse ring when idle & logged in */}
				{!isOpen && !loading && user ? (
					<span className="absolute h-14 w-14 animate-ping rounded-full bg-brand-accent/20" />
				) : null}
			</button>
		</>
	);
}
