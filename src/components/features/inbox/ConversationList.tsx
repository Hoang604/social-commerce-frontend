// src/components/features/inbox/ConversationList.tsx
import { NavLink, useParams } from "react-router-dom";
import { useGetConversations } from "../../../services/inboxApi";
import { Spinner } from "../../ui/Spinner";
import { cn } from "../../../lib/utils";

export const ConversationList = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const numericProjectId = projectId ? parseInt(projectId, 10) : undefined;

  const { data: conversationsResponse, isLoading } =
    useGetConversations(numericProjectId);

  const conversations = conversationsResponse?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <Spinner />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground h-full flex flex-col justify-center">
        <h3 className="font-semibold text-foreground">
          Chưa có cuộc trò chuyện nào
        </h3>
        <p className="text-sm mt-1">
          Khi khách truy cập trang web của bạn gửi tin nhắn, nó sẽ xuất hiện ở
          đây.
        </p>
      </div>
    );
  }

  return (
    <nav className="flex-1">
      {conversations.map((convo) => (
        <NavLink
          key={convo.id}
          to={`/inbox/projects/${projectId}/conversations/${convo.id}`}
          className={({ isActive }) =>
            cn(
              "block p-4 border-b transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
              isActive
                ? "bg-accent text-accent-foreground"
                : "bg-card text-card-foreground"
            )
          }
        >
          <div className="flex justify-between items-center">
            <p className="font-semibold truncate">
              {convo.visitor.displayName}
            </p>
            {convo.unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {convo.unreadCount}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate mt-1">
            {convo.lastMessageSnippet || "Chưa có tin nhắn."}
          </p>
        </NavLink>
      ))}
    </nav>
  );
};
