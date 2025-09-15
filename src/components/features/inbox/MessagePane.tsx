// src/components/features/inbox/MessagePane.tsx
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMessages,
  useGetVisitor,
  type Conversation,
  type Message,
} from "../../../services/inboxApi";
import MessageComposer from "./MessageComposer";
import { Spinner } from "../../../components/ui/Spinner";
import { Avatar } from "../../../components/ui/Avatar";

/**
 * Component displaying detailed visitor information.
 */
const VisitorContextPanel = ({ visitorId }: { visitorId: number }) => {
  const { data: visitor, isLoading } = useGetVisitor(visitorId);

  return (
    <aside className="w-64 bg-card border-l p-4 hidden lg:block">
      <h3 className="font-semibold mb-4 text-foreground">
        Chi tiết Khách truy cập
      </h3>
      {isLoading && <Spinner />}
      {visitor && (
        <div className="text-sm space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar name={visitor.displayName} />
            <p className="font-semibold text-foreground">
              {visitor.displayName}
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Đang xem trang:</p>
            <a
              href={visitor.currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary break-all hover:underline"
            >
              {visitor.currentUrl || "Không rõ"}
            </a>
          </div>
        </div>
      )}
    </aside>
  );
};

/**
 * Component displaying the message list in a conversation.
 */
const MessageList = ({ messages }: { messages: Message[] }) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto flex flex-col-reverse">
      <div>
        {messages?.map((msg) => (
          <div
            key={msg.id}
            className={`flex my-2 items-end gap-2 ${
              !msg.fromCustomer ? "justify-end" : "justify-start"
            }`}
          >
            {!msg.fromCustomer && <div className="flex-grow"></div>}
            <div
              className={`inline-block p-2 px-3 rounded-lg max-w-[80%] break-words ${
                !msg.fromCustomer
                  ? "bg-primary text-primary-foreground" // Agent's message
                  : "bg-muted text-muted-foreground" // Visitor's message
              }`}
            >
              {msg.content}
            </div>
            {msg.fromCustomer && <div className="flex-grow"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Main component for the message display frame.
 */
export const MessagePane = () => {
  const { projectId, conversationId } = useParams<{
    projectId: string;
    conversationId: string;
  }>();
  const queryClient = useQueryClient();

  const convoId = conversationId ? parseInt(conversationId, 10) : undefined;

  const { data: messages, isLoading } = useGetMessages(convoId);

  const conversation = queryClient
    .getQueryData<{ data: Conversation[] }>(["conversations", projectId])
    ?.data.find((c) => c.id === convoId);

  if (!convoId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 flex flex-col bg-background">
        <header className="p-4 border-b font-semibold text-foreground">
          Trò chuyện với {conversation?.visitor?.displayName || "Visitor"}
        </header>

        <MessageList messages={messages || []} />

        <MessageComposer conversationId={convoId} />
      </div>

      {conversation && (
        <VisitorContextPanel visitorId={conversation.visitorId} />
      )}
    </div>
  );
};
