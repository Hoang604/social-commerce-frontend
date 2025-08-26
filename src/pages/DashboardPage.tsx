// src/pages/DashboardPage.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import ConversationList from "../components/features/inbox/ConversationList";
import MessagePane from "../components/features/inbox/MessagePane";
import PageSelector from "../components/features/inbox/PageSelector";

// Function to fetch connected pages
const getConnectedPages = async () => {
  const { data } = await api.get("/connected-pages");
  return data;
};

const DashboardPage = () => {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  // Use react-query to fetch the pages
  const { data: pages, isLoading: isLoadingPages } = useQuery({
    queryKey: ["connectedPages"],
    queryFn: getConnectedPages,
  });

  // Effect to automatically select the first page when the component mounts
  // or when the list of pages becomes available.
  useEffect(() => {
    if (pages && pages.length > 0 && !selectedPageId) {
      setSelectedPageId(pages[0].id);
    }
  }, [pages, selectedPageId]);

  const handlePageChange = (pageId: string | null) => {
    setSelectedPageId(pageId);
    // Reset conversation selection when page changes
    setSelectedConversationId(null);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-white">
      <header className="p-4 border-b">
        {/* Pass the correct handler to PageSelector */}
        <PageSelector
          selectedPageId={selectedPageId}
          onPageChange={handlePageChange}
        />
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 border-r overflow-y-auto">
          {/* Ensure ConversationList is only rendered when there is a selected page */}
          {selectedPageId && !isLoadingPages ? (
            <ConversationList
              pageId={selectedPageId}
              onConversationSelect={setSelectedConversationId}
              selectedConversationId={selectedConversationId}
            />
          ) : (
            <div className="p-4 text-center text-gray-500">
              {isLoadingPages ? "Loading pages..." : "Select a page to start."}
            </div>
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
