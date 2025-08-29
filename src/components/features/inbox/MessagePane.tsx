// src/components/features/inbox/MessagePane.tsx
import { Fragment } from "react";
import { useGetMessages } from "../../../services/inboxApi";
import MessageComposer from "./MessageComposer";
import { Button } from "../../ui/Button";
import { cn } from "../../../lib/utils";

interface MessagePaneProps {
  conversationId: string | null;
}

const MessagePane = ({ conversationId }: MessagePaneProps) => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useGetMessages(conversationId);

  if (!conversationId) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <p>Select a conversation to start messaging.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-background border-l">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Conversation {conversationId}</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto flex flex-col-reverse">
        {status === "pending" ? (
          <p>Loading messages...</p>
        ) : status === "error" ? (
          <p>Error: {error.message}</p>
        ) : (
          <>
            {hasNextPage && (
              <div className="text-center">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="default"
                >
                  {isFetchingNextPage
                    ? "Loading more..."
                    : "Load Older Messages"}
                </Button>
              </div>
            )}
            {data.pages.map((page, i) => (
              <Fragment key={i}>
                {page.data.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "p-2 my-1 rounded-lg max-w-xs",
                      message.fromCustomer
                        ? "bg-muted self-start"
                        : "bg-primary text-primary-foreground self-end",
                      message.status === "sending" && "opacity-60",
                      message.status === "failed" &&
                        "bg-destructive text-destructive-foreground"
                    )}
                  >
                    <p>{message.content}</p>
                  </div>
                ))}
              </Fragment>
            ))}
          </>
        )}
      </div>
      <MessageComposer conversationId={conversationId} />
    </div>
  );
};

export default MessagePane;
