// src/components/features/inbox/ConversationList.tsx

import { useParams, NavLink } from "react-router-dom";
import { useGetConversations } from "../../../services/inboxApi";
import { Spinner } from "../../ui/Spinner";

export const ConversationList = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const numericProjectId = projectId ? parseInt(projectId, 10) : undefined;

  const { data: conversationsResponse, isLoading } =
    useGetConversations(numericProjectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <Spinner />
      </div>
    );
  }

  const conversations = conversationsResponse?.data || [];

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground h-full flex flex-col justify-center">
        <h3 className="font-semibold text-foreground">No conversations yet</h3>
        <p className="text-sm mt-1">
          When your website visitors send a message, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <nav className="flex-1">
      {/* SỬA LỖI: Truy cập vào conversationsResponse.data để map */}
      {conversations.map((convo) => (
        <NavLink
          key={convo.id}
          to={`/inbox/projects/${projectId}/conversations/${convo.id}`}
          className={({ isActive }) =>
            `block p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800 ${
              isActive ? "bg-blue-50 dark:bg-gray-900" : ""
            }`
          }
        >
          <p className="font-semibold text-foreground">
            {convo.visitor.displayName}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {convo.lastMessageSnippet || "No messages yet."}
          </p>
        </NavLink>
      ))}
    </nav>
  );
};
