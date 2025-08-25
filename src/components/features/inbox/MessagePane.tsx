import { useParams } from "react-router-dom";

const MessagePane = () => {
  const { pageId, conversationId } = useParams();

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-600">
        <p>Select a conversation to start messaging.</p>
      </div>
    );
  }

  // TODO: Triển khai useInfiniteQuery để fetch tin nhắn
  // const { data, isLoading } = useMessagesQuery(conversationId);

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-neutral-200">
        <h2 className="font-semibold">Conversation with User</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Khu vực hiển thị tin nhắn sẽ ở đây */}
        <p>
          Messages for conversation {conversationId} of page {pageId} will be
          here.
        </p>
      </div>
      <div className="p-4 border-t border-neutral-200">
        {/* Khu vực soạn tin nhắn sẽ ở đây */}
        <input
          placeholder="Type a message..."
          className="w-full p-2 border rounded-md"
        />
      </div>
    </div>
  );
};

export default MessagePane;
