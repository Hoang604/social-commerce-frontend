import { Outlet, useParams } from "react-router-dom";
import PageSelector from "../components/features/inbox/PageSelector";
import ConversationList from "../components/features/inbox/ConversationList";

const DashboardPage = () => {
  const { conversationId } = useParams();

  return (
    <div className="flex h-screen bg-neutral-100">
      {/* Cột 1: Page Selector & Navigation */}
      <div className="w-64 bg-white border-r border-neutral-200 flex-shrink-0">
        <PageSelector />
      </div>

      {/* Cột 2: Conversation List */}
      <div
        className={`w-80 bg-white flex-shrink-0 border-r border-neutral-200 ${
          conversationId ? "hidden md:flex" : "flex"
        } flex-col`}
      >
        <ConversationList />
      </div>

      {/* Cột 3: Message Pane (sử dụng Outlet để render component con) */}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardPage;
