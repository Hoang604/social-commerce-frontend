import { useParams } from "react-router-dom";
import {
  useMessagesQuery,
  useSendMessageMutation,
} from "../../../services/inboxApi";
import React, { useState } from "react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";

const MessageComposer = ({ conversationId }: { conversationId: string }) => {
  const [content, setContent] = useState("");
  const { mutate: sendMessage, isPending } =
    useSendMessageMutation(conversationId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      sendMessage(content.trim());
      setContent("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 p-4 border-t border-neutral-200"
    >
      <Input
        placeholder="Type a message..."
        className="flex-1"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isPending}
      />
      <Button type="submit" isLoading={isPending}>
        Send
      </Button>
    </form>
  );
};

const MessagePane = () => {
  const { conversationId } = useParams<{ conversationId: string }>();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessagesQuery(conversationId);

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-600">
        <p>Select a conversation to start messaging.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="p-4 border-b border-neutral-200">
        <h2 className="font-semibold">Conversation {conversationId}</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto flex flex-col-reverse">
        {/* Messages are rendered here */}
        {isLoading && <p>Loading messages...</p>}
        {isError && <p>Error loading messages.</p>}

        {hasNextPage && (
          <div className="text-center">
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              variant="secondary"
            >
              {isFetchingNextPage ? "Loading more..." : "Load older messages"}
            </Button>
          </div>
        )}

        {data?.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.data.map((message: any) => (
              <div
                key={message.id}
                className={`p-2 my-1 rounded-lg max-w-xs ${
                  message.fromCustomer
                    ? "bg-neutral-200 self-start"
                    : "bg-primary-500 text-white self-end"
                }`}
              >
                <p>{message.content}</p>
                <span className="text-xs opacity-70">{message.status}</span>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      <MessageComposer conversationId={conversationId} />
    </div>
  );
};

export default MessagePane;
