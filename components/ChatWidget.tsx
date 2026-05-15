"use client";

import { ChatUI } from "@/components/ChatUI";

type ChatWidgetProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed bottom-24 right-4 z-50 flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-panel transition-all duration-300 ease-in-out sm:right-6 sm:w-[390px] ${
        isOpen
          ? "pointer-events-auto scale-100 opacity-100"
          : "pointer-events-none scale-95 opacity-0"
      }`}
      style={{ width: "min(390px, calc(100vw - 2rem))", height: "560px" }}
    >
      {/* Header */}
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-slate-100 bg-ink px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sea text-xs font-bold text-white">
          AI
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">AI Tutor</p>
          <p className="text-xs text-white/60">Grounded answers in seconds</p>
        </div>
        <button
          id="chat-widget-close"
          onClick={onClose}
          aria-label="Close chat"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
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

      {/* Body — scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {isOpen ? <ChatUI mode="widget" onClose={onClose} /> : null}
      </div>
    </div>
  );
}
