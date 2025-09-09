// src/widget/components/Composer.tsx
import { useState, useRef } from "preact/hooks";
import type { FormEvent } from "react";
import { type ConnectionStatus } from "../types";

interface ComposerProps {
  onSendMessage: (content: string) => void;
  onTypingChange: (isTyping: boolean) => void;
  connectionStatus: ConnectionStatus;
}

const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

export const Composer = ({
  onSendMessage,
  onTypingChange,
  connectionStatus,
}: ComposerProps) => {
  const [content, setContent] = useState("");
  const typingTimeoutRef = useRef<number | null>(null);
  const isDisabled = connectionStatus !== "connected";

  const handleTyping = (e: FormEvent<HTMLTextAreaElement>) => {
    setContent(e.currentTarget.value);

    if (!typingTimeoutRef.current) {
      onTypingChange(true);
    } else {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      onTypingChange(false);
      typingTimeoutRef.current = null;
    }, 1500);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (content.trim()) {
      onSendMessage(content.trim());
      setContent("");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      onTypingChange(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 border-t">
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        <textarea
          value={content}
          onInput={handleTyping}
          disabled={isDisabled}
          placeholder={isDisabled ? "Connecting..." : "Type a message..."}
          className="w-full bg-transparent resize-none border-none focus:ring-0 p-2"
          rows={1}
        />
        <button
          type="submit"
          disabled={!content.trim() || isDisabled}
          className="p-2 text-blue-500 disabled:text-gray-400 transition-colors"
        >
          <SendIcon />
        </button>
      </div>
    </form>
  );
};
