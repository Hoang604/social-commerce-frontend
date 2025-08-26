// src/pages/DashboardPage.tsx
import { useState } from "react";
import ConversationList from "../components/features/inbox/ConversationList";
import MessagePane from "../components/features/inbox/MessagePane";
import PageSelector from "../components/features/inbox/PageSelector";

const DashboardPage = () => {
  // Giả sử pageId được lấy từ URL hoặc một state global khác
  // Để đơn giản, chúng ta sẽ hardcode hoặc dùng state tạm
  const [selectedPageId, setSelectedPageId] = useState<string | null>(
    "YOUR_DEFAULT_PAGE_ID" // Thay thế bằng ID trang thực tế hoặc logic chọn trang
  );
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="p-4 border-b">
        <PageSelector
          selectedPageId={selectedPageId}
          onPageChange={setSelectedPageId}
        />
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 border-r overflow-y-auto">
          {selectedPageId && (
            <ConversationList
              pageId={selectedPageId}
              onConversationSelect={setSelectedConversationId}
              selectedConversationId={selectedConversationId}
            />
          )}
        </div>
        <div className="flex-1 flex">
          <MessagePane conversationId={selectedConversationId} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
