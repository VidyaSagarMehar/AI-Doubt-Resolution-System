'use client';

import { ChatUI } from '@/components/ChatUI';

type ChatWidgetProps = {
	isOpen: boolean;
	onClose: () => void;
};

export function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
	return (
		<div
			aria-hidden={!isOpen}
			className={`fixed bottom-24 right-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-card transition-all duration-300 ease-in-out sm:right-6 ${
				isOpen
					? 'pointer-events-auto scale-100 opacity-100'
					: 'pointer-events-none scale-95 opacity-0'
			}`}
			style={{ width: 'min(390px, calc(100vw - 2rem))', height: '560px' }}
		>
			{/* Header */}
			<div className="flex shrink-0 items-center gap-3 border-b border-brand-border bg-brand-bg px-5 py-4">
				<div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-accent/30 bg-brand-accent/10">
					<span className="font-display text-xs font-bold text-brand-accent">
						AI
					</span>
				</div>
				<div className="flex-1">
					<p className="font-display text-sm font-semibold text-brand-text">
						AI Tutor
					</p>
					<p className="text-xs text-brand-neutral/50">
						Grounded answers in seconds
					</p>
				</div>
				<button
					id="chat-widget-close"
					onClick={onClose}
					aria-label="Close chat"
					className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-neutral/50 transition-colors duration-150 hover:bg-brand-border hover:text-brand-text"
				>
					<svg
						className="h-4 w-4"
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
				</button>
			</div>

			{/* Scrollable body */}
			<div className="flex-1 overflow-y-auto p-4">
				{isOpen ? <ChatUI mode="widget" onClose={onClose} /> : null}
			</div>
		</div>
	);
}
