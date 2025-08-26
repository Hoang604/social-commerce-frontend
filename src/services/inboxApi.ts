// src/services/inboxApi.ts
import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import api from "../lib/api";
import { v4 as uuidv4 } from "uuid";

// --- Types ---
type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";
type CommentStatus = "sending" | "sent" | "failed" | "received";

export interface Message {
  id: number | string;
  conversationId: string;
  content: string | null;
  attachments: any[] | null;
  senderId: string;
  fromCustomer: boolean;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  // Thêm các thuộc tính khác của conversation ở đây
  lastMessage: Message;
  participant: {
    name: string;
    profilePic: string;
  };
}

export interface Comment {
  id: number | string;
  facebookPostId: string;
  facebookCommentId: string | null;
  parentCommentId: number | null;
  content: string | null;
  senderId: string;
  fromCustomer: boolean;
  status: CommentStatus;
  createdAt: string;
}

interface SendMessagePayload {
  conversationId: string;
  text: string;
}

interface ReplyCommentPayload {
  parentCommentId: number;
  text: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// --- Infinite Query Hooks ---

export const useGetConversations = (pageId: string | null) => {
  return useInfiniteQuery<
    PaginatedResponse<Conversation>,
    Error,
    InfiniteData<PaginatedResponse<Conversation>>,
    QueryKey,
    number
  >({
    queryKey: ["conversations", pageId],
    queryFn: async ({ pageParam }) => {
      const res = await api.get(`/inbox/conversations`, {
        params: { page: pageParam, limit: 15, pageId },
      });
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < Math.ceil(lastPage.total / lastPage.limit)) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: !!pageId,
  });
};

export const useGetMessages = (conversationId: string | null) => {
  return useInfiniteQuery<
    PaginatedResponse<Message>,
    Error,
    InfiniteData<PaginatedResponse<Message>>,
    QueryKey,
    number
  >({
    queryKey: ["messages", conversationId],
    queryFn: async ({ pageParam }) => {
      const res = await api.get(
        `/inbox/conversations/${conversationId}/messages`,
        {
          params: { page: pageParam, limit: 20 },
        }
      );
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < Math.ceil(lastPage.total / lastPage.limit)) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: !!conversationId,
  });
};

// --- Mutation Hooks ---

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      api.post(`/inbox/conversations/${payload.conversationId}/messages`, {
        text: payload.text,
      }),

    onMutate: async (newMessagePayload) => {
      const queryKey = ["messages", newMessagePayload.conversationId];
      await queryClient.cancelQueries({ queryKey });

      const optimisticMessage: Message = {
        id: uuidv4(),
        conversationId: newMessagePayload.conversationId,
        content: newMessagePayload.text,
        status: "sending",
        fromCustomer: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: [],
        senderId: "me",
      };

      queryClient.setQueryData<InfiniteData<PaginatedResponse<Message>>>(
        queryKey,
        (oldData) => {
          const newData = oldData
            ? JSON.parse(JSON.stringify(oldData))
            : { pages: [], pageParams: [1] };

          if (newData.pages.length > 0) {
            newData.pages[0].data.unshift(optimisticMessage);
          } else {
            newData.pages.push({
              data: [optimisticMessage],
              total: 1,
              page: 1,
              limit: 20,
            });
          }
          return newData;
        }
      );

      return { optimisticMessageId: optimisticMessage.id };
    },

    onSuccess: (result, variables, context) => {
      const queryKey = ["messages", variables.conversationId];
      const finalMessage = result.data;
      queryClient.setQueryData<InfiniteData<PaginatedResponse<Message>>>(
        queryKey,
        (oldData) => {
          if (!oldData) return oldData;
          const newPages = oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((msg) =>
              msg.id === context?.optimisticMessageId ? finalMessage : msg
            ),
          }));
          return { ...oldData, pages: newPages };
        }
      );
    },

    onError: (_error, variables, context) => {
      const queryKey = ["messages", variables.conversationId];
      if (context?.optimisticMessageId) {
        queryClient.setQueryData<InfiniteData<PaginatedResponse<Message>>>(
          queryKey,
          (oldData) => {
            if (!oldData) return oldData;
            const newPages = oldData.pages.map((page) => ({
              ...page,
              data: page.data.map((msg) =>
                msg.id === context.optimisticMessageId
                  ? { ...msg, status: "failed" as MessageStatus }
                  : msg
              ),
            }));
            return { ...oldData, pages: newPages };
          }
        );
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useReplyToComment = (facebookPostId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReplyCommentPayload) =>
      api.post(`/inbox/comments/${payload.parentCommentId}/replies`, {
        text: payload.text,
      }),

    onMutate: async (newReplyPayload) => {
      const queryKey = ["comments", facebookPostId];
      await queryClient.cancelQueries({ queryKey });

      const optimisticComment: Comment = {
        id: uuidv4(),
        content: newReplyPayload.text,
        status: "sending",
        fromCustomer: false,
        createdAt: new Date().toISOString(),
        parentCommentId: newReplyPayload.parentCommentId,
        facebookPostId: facebookPostId,
        facebookCommentId: null,
        senderId: "me",
      };

      queryClient.setQueryData<InfiniteData<PaginatedResponse<Comment>>>(
        queryKey,
        (oldData) => {
          const newData = oldData
            ? JSON.parse(JSON.stringify(oldData))
            : { pages: [], pageParams: [1] };
          if (newData.pages.length > 0) {
            newData.pages[0].data.unshift(optimisticComment);
          } else {
            newData.pages.push({
              data: [optimisticComment],
              total: 1,
              page: 1,
              limit: 20,
            });
          }
          return newData;
        }
      );

      return { optimisticCommentId: optimisticComment.id };
    },

    onSuccess: (result, _variables, context) => {
      const queryKey = ["comments", facebookPostId];
      const finalComment = result.data;
      queryClient.setQueryData<InfiniteData<PaginatedResponse<Comment>>>(
        queryKey,
        (oldData) => {
          if (!oldData) return oldData;
          const newPages = oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((c) =>
              c.id === context?.optimisticCommentId ? finalComment : c
            ),
          }));
          return { ...oldData, pages: newPages };
        }
      );
    },

    onError: (_error, _variables, context) => {
      const queryKey = ["comments", facebookPostId];
      if (context?.optimisticCommentId) {
        queryClient.setQueryData<InfiniteData<PaginatedResponse<Comment>>>(
          queryKey,
          (oldData) => {
            if (!oldData) return oldData;
            const newPages = oldData.pages.map((page) => ({
              ...page,
              data: page.data.map((c) =>
                c.id === context.optimisticCommentId
                  ? { ...c, status: "failed" as CommentStatus }
                  : c
              ),
            }));
            return { ...oldData, pages: newPages };
          }
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", facebookPostId] });
    },
  });
};
