import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../../../lib/api";
import { cn } from "../../../lib/utils";

const getConversations = async ({
  pageParam = 1,
  queryKey,
}: {
  pageParam?: number;
  queryKey: any[];
}) => {
  const [, pageId] = queryKey;
  if (!pageId) return { data: [], nextPage: undefined };

  const { data } = await api.get(`/inbox/conversations`, {
    params: { connectedPageId: pageId, page: pageParam, limit: 20 },
  });
  return {
    data: data.data,
    nextPage: data.total > pageParam * data.limit ? pageParam + 1 : undefined,
  };
};

interface ConversationListProps {
  pageId: string;
  onConversationSelect: (conversationId: string | null) => void;
  selectedConversationId: string | null;
}

const ConversationList = ({
  pageId,
  onConversationSelect,
  selectedConversationId,
}: ConversationListProps) => {
  const { data, fetchNextPage, hasNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["conversations", pageId],
      queryFn: getConversations,
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: 1,
    });

  if (!pageId) {
    return (
      <div className="p-4 text-center text-neutral-600">
        Please select a page to view conversations.
      </div>
    );
  }

  if (isLoading) return <div>Loading Conversations...</div>;
  if (isError) return <div>Error loading conversations.</div>;

  return (
    <div className="flex-1 overflow-y-auto">
      {data?.pages.map((page, i) => (
        <React.Fragment key={i}>
          {page.data.map((conv: any) => (
            <div
              key={conv.id}
              onClick={() => onConversationSelect(conv.id.toString())}
              className={cn(
                "p-4 border-b border-neutral-200 cursor-pointer hover:bg-neutral-100",
                conv.id.toString() === selectedConversationId
                  ? "bg-primary-100"
                  : ""
              )}
            >
              <p className="font-semibold">{conv.participant.name}</p>
              <p className="text-sm text-neutral-600 truncate">
                {conv.lastMessageSnippet}
              </p>
            </div>
          ))}
        </React.Fragment>
      ))}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          className="w-full p-2 text-primary-500"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default ConversationList;
