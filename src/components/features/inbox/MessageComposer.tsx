// src/components/features/inbox/MessageComposer.tsx

import React, { useState } from "react";
// SỬA LỖI: Import đúng tên hook là useSendAgentReply
import { useSendAgentReply } from "../../../services/inboxApi";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Send } from "lucide-react";

interface MessageComposerProps {
  // SỬA LỖI: conversationId nên là kiểu number để khớp với API
  conversationId: number;
}

const MessageComposer = ({ conversationId }: MessageComposerProps) => {
  const [content, setContent] = useState("");
  // SỬA LỖI: Sử dụng đúng hook đã import
  const { mutate: sendMessage, isPending } = useSendAgentReply();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      // Dữ liệu gửi đi khớp với SendMessagePayload trong inboxApi
      sendMessage({ conversationId, text: content.trim() });
      setContent("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-4 border-t bg-white"
    >
      <Input
        type="text"
        placeholder="Type a message..."
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
