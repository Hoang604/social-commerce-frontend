// src/pages/DashboardPage.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import ConversationList from "../components/features/inbox/ConversationList";
import MessagePane from "../components/features/inbox/MessagePane";
import PageSelector from "../components/features/inbox/PageSelector";

const getConnectedPages = async () => {
  const { data } = await api.get("/connected-pages");
  return data;
};

const DashboardPage = () => {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  const { data: pages, isLoading: isLoadingPages } = useQuery({
    queryKey: ["connectedPages"],
    queryFn: getConnectedPages,
  });

  useEffect(() => {
    if (pages && pages.length > 0 && !selectedPageId) {
      setSelectedPageId(pages[0].id);
    }
  }, [pages, selectedPageId]);

  const handlePageChange = (pageId: string | null) => {
    setSelectedPageId(pageId);
    setSelectedConversationId(null);
  };

  return (
    // Remove the overriding background color from here
    <div className="h-full w-full flex flex-col">
      {/* Give the PageSelector header a card background */}
      <header className="p-4 border-b bg-card">
        <PageSelector
          selectedPageId={selectedPageId}
          onPageChange={handlePageChange}
        />
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* The sidebar now uses the card background */}
        <div className="w-1/4 border-r overflow-y-auto bg-card">
          {selectedPageId && !isLoadingPages ? (
            <ConversationList
              pageId={selectedPageId}
              onConversationSelect={setSelectedConversationId}
              selectedConversationId={selectedConversationId}
            />
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              {isLoadingPages ? "Loading pages..." : "Select a page to start."}
            </div>
          )}
        </div>
        {/* The MessagePane area */}
        <div className="flex-1 flex">
          <MessagePane conversationId={selectedConversationId} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
