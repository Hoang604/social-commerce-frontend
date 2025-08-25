import {
  useInfiniteQuery,
  useMutation,
  QueryClient,
} from "@tanstack/react-query";
import api from "../lib/api";

// This instance would ideally be imported from a central file like main.tsx
export const queryClient = new QueryClient();

// --- Types ---
interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    profile_pic_url?: string;
  };
  status: "sending" | "sent" | "failed";
  created_at: string;
  temp_id?: string;
}

interface GetMessagesResponse {
  data: Message[];
  next_cursor: string | null;
}

// --- Get Messages ---
const getMessages = async ({
  pageParam,
  queryKey,
}: {
  pageParam?: string;
  queryKey: any[];
}): Promise<GetMessagesResponse> => {
  const [, conversationId] = queryKey;
  const { data } = await api.get(
    `/inbox/conversations/${conversationId}/messages`,
    {
      params: {
        limit: 30,
        cursor: pageParam,
      },
    }
  );
  return data;
};

export const useMessagesQuery = (conversationId: string | undefined) => {
  return useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: getMessages,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    initialPageParam: undefined,
    enabled: !!conversationId,
  });
};

// --- Send Message ---
const sendMessage = async (payload: {
  conversationId: string;
  content: string;
}) => {
  const { data } = await api.post(
    `/inbox/conversations/${payload.conversationId}/messages`,
    { text: payload.content }
  );
  return data;
};

export const useSendMessageMutation = (conversationId: string) => {
  return useMutation({
    mutationFn: (content: string) => sendMessage({ conversationId, content }),
    onMutate: async (content: string) => {
      await queryClient.cancelQueries({
        queryKey: ["messages", conversationId],
      });

      const previousMessages = queryClient.getQueryData<any>([
        "messages",
        conversationId,
      ]);

      const tempId = `temp_${Date.now()}`;
      const optimisticMessage: Message = {
        id: tempId,
        temp_id: tempId,
        content,
        sender: {
          id: "shop_user_id_placeholder",
          name: "Your Shop",
        },
        status: "sending",
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(["messages", conversationId], (oldData: any) => {
        const newData = { ...oldData };
        if (newData.pages && newData.pages.length > 0) {
          newData.pages[0].data.unshift(optimisticMessage);
        }
        return newData;
      });

      return { previousMessages, tempId };
    },
    onError: (_err, _content, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["messages", conversationId],
          context.previousMessages
        );
      }
      // Update temp message status to 'failed'
      queryClient.setQueryData(["messages", conversationId], (oldData: any) => {
        const newData = { ...oldData };
        const pageIndex = newData.pages.findIndex((p: any) =>
          p.data.some((m: Message) => m.id === context?.tempId)
        );
        if (pageIndex > -1) {
          const messageIndex = newData.pages[pageIndex].data.findIndex(
            (m: Message) => m.id === context?.tempId
          );
          if (messageIndex > -1) {
            newData.pages[pageIndex].data[messageIndex].status = "failed";
          }
        }
        return newData;
      });
    },
    onSuccess: (_data, _variables, _context) => {
      // Logic to update the message with the real ID from the server will be handled
      // by the `message:status:updated` WebSocket event to prevent race conditions.
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
