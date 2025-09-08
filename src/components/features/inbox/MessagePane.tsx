import { useParams } from "react-router-dom";
import {
  useGetMessages,
  useGetVisitor,
  type Conversation,
} from "../../../services/inboxApi";
import { useQueryClient } from "@tanstack/react-query";
import MessageComposer from "./MessageComposer";
import { Spinner } from "../../../components/ui/Spinner";

const VisitorContextPanel = ({ visitorId }: { visitorId: number }) => {
  const { data: visitor, isLoading } = useGetVisitor(visitorId);

  return (
    <aside className="w-64 bg-white border-l p-4">
      <h3 className="font-semibold mb-4">Visitor Details</h3>
      {isLoading && <Spinner />}
      {visitor && (
        <div className="text-sm space-y-2">
          <p>
            <strong>Name:</strong> {visitor.displayName}
          </p>
          <div>
            <p>
              <strong>Viewing:</strong>
            </p>
            <a
              href={visitor.currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 break-all hover:underline"
            >
              {visitor.currentUrl || "N/A"}
            </a>
          </div>
        </div>
      )}
    </aside>
  );
};

export const MessagePane = () => {
  const { projectId, conversationId } = useParams<{
    projectId: string;
    conversationId: string;
  }>();
  const queryClient = useQueryClient();

  const convoId = conversationId ? parseInt(conversationId, 10) : undefined;

  const { data: messages, isLoading } = useGetMessages(convoId);

  // Get conversation data directly from cache, populated by the ConversationList query
  const conversation = queryClient
    .getQueryData<Conversation[]>(["conversations", projectId])
    ?.find((c) => c.id === convoId);

  if (!convoId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a conversation to view messages.
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 flex flex-col bg-white">
        <header className="p-4 border-b font-semibold">
          Conversation with {conversation?.visitor?.displayName || "Visitor"}
        </header>
        <div className="flex-1 p-4 overflow-y-auto flex flex-col-reverse">
          <div>
            {" "}
            {/* This div acts as a scroll anchor */}
            {messages
              ?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex my-2 ${
                    !msg.fromCustomer ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`inline-block p-2 px-3 rounded-lg max-w-xs break-words ${
                      !msg.fromCustomer
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
              .reverse()}
          </div>
        </div>
        <MessageComposer conversationId={convoId} />
      </div>
      {conversation && (
        <VisitorContextPanel visitorId={conversation.visitorId} />
      )}
    </div>
  );
};
