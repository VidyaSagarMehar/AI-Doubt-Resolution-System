"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ChatWidgetContextValue = {
  isOpen: boolean;
  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;
};

const ChatWidgetContext = createContext<ChatWidgetContextValue | undefined>(
  undefined,
);

export function ChatWidgetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const openWidget = useCallback(() => setIsOpen(true), []);
  const closeWidget = useCallback(() => setIsOpen(false), []);
  const toggleWidget = useCallback(() => setIsOpen((prev) => !prev), []);

  const value = useMemo(
    () => ({ isOpen, openWidget, closeWidget, toggleWidget }),
    [isOpen, openWidget, closeWidget, toggleWidget],
  );

  return (
    <ChatWidgetContext.Provider value={value}>
      {children}
    </ChatWidgetContext.Provider>
  );
}

export function useChatWidget() {
  const context = useContext(ChatWidgetContext);

  if (!context) {
    throw new Error("useChatWidget must be used within ChatWidgetProvider.");
  }

  return context;
}
