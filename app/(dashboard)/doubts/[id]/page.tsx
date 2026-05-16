'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RecommendationList } from '@/components/RecommendationList';
import { useAuth } from '@/components/providers/AuthProvider';
import type { DoubtDetail, FeedbackPayload } from '@/types';
import { formatDate, getStatusTone } from '@/lib/utils';

export default function DoubtDetailPage() {
	const params = useParams<{ id: string }>();
	const { user } = useAuth();
	const [doubt, setDoubt] = useState<DoubtDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [feedbackLoading, setFeedbackLoading] = useState(false);
	const [submittedFeedback, setSubmittedFeedback] = useState<boolean | null>(
		null,
	);
	const [escalating, setEscalating] = useState(false);
	const [replyMessage, setReplyMessage] = useState('');
	const [replying, setReplying] = useState(false);

	useEffect(() => {
		const loadDoubt = async () => {
			try {
				const response = await fetch(`/api/doubts/${params.id}`);
				const payload = await response.json();

				if (!response.ok) {
					if (response.status === 401) {
						window.location.href = '/login';
						return;
					}
					if (response.status === 403) {
						window.location.href = '/doubts';
						return;
					}
					throw new Error(payload.error ?? 'Failed to load doubt.');
				}

				setDoubt(payload.data);

				// If feedback already exists for this doubt, pre-populate the state
				const existingFeedback: FeedbackPayload[] =
					payload.data?.feedback ?? [];
				if (existingFeedback.length > 0) {
					setSubmittedFeedback(
						existingFeedback[existingFeedback.length - 1].isHelpful,
					);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load doubt.');
			} finally {
				setLoading(false);
			}
		};

		if (params.id) void loadDoubt();
	}, [params.id]);

	const submitFeedback = async (isHelpful: boolean) => {
		if (!doubt || submittedFeedback !== null) return;
		setFeedbackLoading(true);
		try {
			const response = await fetch('/api/feedback', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ doubtId: doubt._id, isHelpful }),
			});
			const payload = await response.json();
			if (!response.ok) {
				if (response.status === 401) {
					window.location.href = '/login';
					return;
				}
				if (response.status === 403) {
					window.location.href = '/doubts';
					return;
				}
				throw new Error(payload.error ?? 'Failed to submit feedback.');
			}
			setSubmittedFeedback(isHelpful);
			toast.success(
				isHelpful
					? '👍 Glad it helped! Feedback recorded.'
					: '👎 Feedback noted. Consider escalating to a mentor.',
				{ autoClose: 4000 },
			);
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : 'Failed to submit feedback.';
			toast.error(`❌ ${msg}`);
		} finally {
			setFeedbackLoading(false);
		}
	};

	const escalate = async () => {
		if (!doubt) return;
		setEscalating(true);
		try {
			const response = await fetch('/api/escalate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ doubtId: doubt._id }),
			});
			const payload = await response.json();
			if (!response.ok) {
				if (response.status === 401) {
					window.location.href = '/login';
					return;
				}
				if (response.status === 403) {
					window.location.href = '/doubts';
					return;
				}
				throw new Error(payload.error ?? 'Failed to escalate doubt.');
			}
			setDoubt(payload.data);
			toast.success(
				"🚀 Doubt escalated to a mentor! You'll be notified when they reply.",
				{ autoClose: 5000 },
			);
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : 'Failed to escalate doubt.';
			toast.error(`❌ ${msg}`);
		} finally {
			setEscalating(false);
		}
	};

	const submitMentorReply = async () => {
		if (!doubt || !replyMessage.trim()) return;
		setReplying(true);
		try {
			const response = await fetch('/api/mentor/reply', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ doubtId: doubt._id, message: replyMessage }),
			});
			const payload = await response.json();
			if (!response.ok) {
				if (response.status === 401) {
					window.location.href = '/login';
					return;
				}
				if (response.status === 403) {
					window.location.href = '/mentor';
					return;
				}
				throw new Error(payload.error ?? 'Failed to send mentor reply.');
			}
			setDoubt(payload.data);
			setReplyMessage('');
			toast.success('✅ Reply sent to the student successfully!');
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : 'Failed to send mentor reply.';
			toast.error(`❌ ${msg}`);
		} finally {
			setReplying(false);
		}
	};

	/* State UI */
	const StateCard = ({ children }: { children: React.ReactNode }) => (
		<div className="rounded-2xl border border-brand-border bg-brand-surface p-8 shadow-panel">
			{children}
		</div>
	);

	if (loading)
		return (
			<StateCard>
				<p className="text-brand-neutral/70">Loading doubt...</p>
			</StateCard>
		);
	if (error)
		return (
			<StateCard>
				<p className="text-brand-accent">{error}</p>
			</StateCard>
		);
	if (!doubt)
		return (
			<StateCard>
				<p className="text-brand-neutral/70">Doubt not found.</p>
			</StateCard>
		);

	const isMentor = user?.role === 'mentor';
	const hasMentorReplies = (doubt.mentorReplies?.length ?? 0) > 0;
	const alreadyEscalated =
		doubt.status === 'escalated' || doubt.status === 'mentor_replied';

	return (
		<section className="space-y-6">
			{/* Doubt header card */}
			<div className="rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-panel">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<p className="font-display text-xs font-semibold uppercase tracking-[0.32em] text-brand-accent">
							Doubt Detail
						</p>
						<h2 className="font-display mt-2 text-2xl font-bold text-brand-text">
							{doubt.title}
						</h2>
					</div>
					<span
						className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusTone(doubt.status)}`}
					>
						{doubt.status.replace('_', ' ')}
					</span>
				</div>
				<p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-brand-neutral/80">
					{doubt.description}
				</p>
				<p className="mt-4 text-xs text-brand-neutral/50">
					{formatDate(doubt.createdAt)}
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
				<div className="space-y-6">
					{/* AI Answer */}
					<div className="rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-panel">
						<div className="flex items-center justify-between gap-4">
							<h3 className="font-display text-lg font-semibold text-brand-text">
								AI Answer
							</h3>
							{doubt.aiResponse?.confidenceScore !== undefined ? (
								<span className="rounded-full border border-brand-success/30 bg-brand-success/10 px-3 py-1 text-xs font-semibold text-brand-success">
									Confidence{' '}
									{(doubt.aiResponse.confidenceScore * 100).toFixed(1)}%
								</span>
							) : null}
						</div>

						{doubt.aiResponse ? (
							<>
								<div className="mt-4 prose prose-invert max-w-none text-sm leading-7 text-brand-neutral/80">
									<ReactMarkdown remarkPlugins={[remarkGfm]}>
										{doubt.aiResponse.answer}
									</ReactMarkdown>
								</div>

								{!isMentor ? (
									<div className="mt-6 space-y-4">
										{/* Feedback action row */}
										<div className="flex flex-wrap items-center gap-3">
											{submittedFeedback !== null ? (
												/* ── Feedback already submitted — show persistent badge ── */
												<div
													className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
														submittedFeedback
															? 'border-brand-success/50 bg-brand-accent/10 text-brand-success'
															: 'border-brand-accent/50 bg-brand-accent/10 text-brand-accent'
													}`}
												>
													{submittedFeedback ? (
														<>
															<svg
																className="h-4 w-4"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
															</svg>
															Marked as Helpful
														</>
													) : (
														<>
															<svg
																className="h-4 w-4"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
															</svg>
															Marked as Not Helpful
														</>
													)}
												</div>
											) : (
												/* ── Feedback not yet submitted — show buttons ── */
												<>
													<p className="text-xs text-brand-neutral/50">
														Was this answer helpful?
													</p>
													<button
														onClick={() => void submitFeedback(true)}
														disabled={feedbackLoading}
														className="font-display inline-flex items-center gap-2 rounded-full border border-brand-success/40 px-4 py-2 text-sm font-medium text-brand-success transition-colors duration-150 hover:bg-brand-success/10 disabled:cursor-not-allowed disabled:opacity-50"
													>
														<svg
															className="h-4 w-4"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
														</svg>
														Helpful
													</button>
													<button
														onClick={() => void submitFeedback(false)}
														disabled={feedbackLoading}
														className="font-display inline-flex items-center gap-2 rounded-full border border-brand-border px-4 py-2 text-sm font-medium text-brand-neutral/70 transition-colors duration-150 hover:border-brand-accent/40 hover:text-brand-accent disabled:cursor-not-allowed disabled:opacity-50"
													>
														<svg
															className="h-4 w-4"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
														</svg>
														Not helpful
													</button>
												</>
											)}
										</div>

										{/* Escalate button — separate row */}
										<div>
											<button
												onClick={() => void escalate()}
												disabled={escalating || alreadyEscalated}
												className={`font-display inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
													alreadyEscalated
														? 'border-brand-link/20 text-brand-link/50'
														: 'border-brand-link/40 text-brand-link hover:bg-brand-link/10'
												}`}
											>
												{doubt.status === 'mentor_replied' ? (
													<>✅ Mentor replied</>
												) : doubt.status === 'escalated' ? (
													<>🚀 Escalated to mentor</>
												) : escalating ? (
													<>⏳ Escalating...</>
												) : (
													<>🚀 Escalate to mentor</>
												)}
											</button>
											{!alreadyEscalated && (
												<p className="mt-1.5 text-xs text-brand-neutral/40">
													Not satisfied with the AI answer? Escalate for a human
													mentor to review.
												</p>
											)}
										</div>
									</div>
								) : null}
							</>
						) : (
							<p className="mt-4 text-sm text-brand-neutral/60">
								No AI response stored for this doubt yet.
							</p>
						)}
					</div>

					{/* Mentor Conversation */}
					<div className="rounded-2xl border border-brand-border bg-brand-surface p-6 shadow-panel">
						<div className="flex items-center justify-between gap-4">
							<h3 className="font-display text-lg font-semibold text-brand-text">
								Mentor Conversation
							</h3>
							{hasMentorReplies ? (
								<span className="rounded-full border border-brand-link/30 bg-brand-link/10 px-3 py-1 text-xs font-semibold text-brand-link">
									{doubt.mentorReplies?.length} repl
									{doubt.mentorReplies?.length === 1 ? 'y' : 'ies'}
								</span>
							) : null}
						</div>

						{hasMentorReplies ? (
							<div className="mt-4 space-y-4">
								{doubt.mentorReplies?.map((reply) => (
									<div
										key={reply._id}
										className="rounded-xl border border-brand-border bg-brand-bg p-4"
									>
										<div className="flex flex-wrap items-center justify-between gap-2">
											<p className="font-display text-sm font-semibold text-brand-text">
												{reply.mentorName}
											</p>
											<p className="text-xs text-brand-neutral/50">
												{formatDate(reply.createdAt)}
											</p>
										</div>
										<div className="mt-3 prose prose-invert max-w-none text-sm leading-7 text-brand-neutral/80">
											<ReactMarkdown remarkPlugins={[remarkGfm]}>
												{reply.message}
											</ReactMarkdown>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="mt-4 text-sm text-brand-neutral/60">
								{isMentor
									? 'No mentor reply has been sent yet.'
									: 'No mentor reply yet. If this doubt has been escalated, the mentor response will appear here.'}
							</p>
						)}

						{isMentor ? (
							<div className="mt-6 space-y-3">
								<label
									htmlFor="mentor-reply"
									className="block text-sm font-medium text-brand-neutral/80"
								>
									Reply to the student
								</label>
								<textarea
									id="mentor-reply"
									value={replyMessage}
									onChange={(event) => setReplyMessage(event.target.value)}
									placeholder="Write a clear explanation, next step, or correction for the student."
									className="!min-h-36"
								/>
								<button
									onClick={() => void submitMentorReply()}
									disabled={replying || !replyMessage.trim()}
									className="font-display rounded-full bg-brand-accent px-5 py-2.5 text-sm font-semibold text-brand-bg transition-all duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{replying ? 'Sending reply...' : 'Send mentor reply'}
								</button>
							</div>
						) : null}
					</div>
				</div>

				<RecommendationList
					resources={doubt.aiResponse?.recommendedResources ?? []}
					title="Recommended Resources"
				/>
			</div>
		</section>
	);
}
