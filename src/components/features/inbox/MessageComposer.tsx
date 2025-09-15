// src/components/features/inbox/MessageComposer.tsx

import React, { useState } from "react";
import { useSendAgentReply } from "../../../services/inboxApi";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Send } from "lucide-react";

interface MessageComposerProps {
  conversationId: number;
}

const MessageComposer = ({ conversationId }: MessageComposerProps) => {
  const [content, setContent] = useState("");
  const { mutate: sendMessage, isPending } = useSendAgentReply();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      sendMessage({ conversationId, text: content.trim() });
      setContent("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-4 border-t bg-card"
    >
      <Input
        type="text"
        placeholder="Nhập tin nhắn..."
        className="flex-1"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isPending}
        autoComplete="off"
      />
      <Button type="submit" disabled={isPending || !content.trim()} size="icon">
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};

export default MessageComposer;
