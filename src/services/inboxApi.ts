// src/services/inboxApi.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { v4 as uuidv4 } from "uuid";

// --- Type Definitions ---
// (These types should align with backend entities after refactoring)

export interface Visitor {
  id: number;
  displayName: string;
  currentUrl?: string; // For real-time context
  // other metadata
}

export interface Conversation {
  id: number;
  projectId: number;
  visitorId: number;
  visitor: Visitor;
  lastMessageSnippet: string | null;
  lastMessageTimestamp: string | null;
  status: "open" | "closed";
  unreadCount: number;
}

export interface Message {
  id: number | string; // Can be a temp string for optimistic UI
  conversationId: number;
  content: string | null;
  fromCustomer: boolean;
  status: "sending" | "sent" | "failed";
  createdAt: string;
}

interface SendMessagePayload {
  conversationId: number;
  text: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface UpdateConversationPayload {
  conversationId: number;
  status: "open" | "closed";
}

// --- API Functions ---

export const updateConversationStatus = async (
  payload: UpdateConversationPayload
) => {
  const response = await api.patch(
    `/inbox/conversations/${payload.conversationId}`,
    { status: payload.status }
  );
  return response.data;
};

interface AgentTypingPayload {
  conversationId: number;
  isTyping: boolean;
}

export const sendAgentTypingStatus = async (payload: AgentTypingPayload) => {
  // API này trả về 204 No Content, nên không cần xử lý response.data
  await api.post(`/inbox/conversations/${payload.conversationId}/typing`, {
    isTyping: payload.isTyping,
  });
};

const getConversationsByProjectId = async (
  projectId: number
): Promise<PaginatedResponse<Conversation>> => {
  const response = await api.get(`/inbox/conversations`, {
    params: { projectId },
  });
  return response.data;
};

const getMessages = async (conversationId: number): Promise<Message[]> => {
  const response = await api.get(
    `/inbox/conversations/${conversationId}/messages`
  );
  return response.data.data; // Assuming paginated response
};

const getVisitorById = async (visitorId: number): Promise<Visitor> => {
  // PHẢN HỒI KIẾN TRÚC: Backend cần cung cấp endpoint này.
  // Ví dụ: GET /inbox/visitors/:visitorId
  // Hiện tại, chúng ta sẽ giả định nó tồn tại để hoàn thiện frontend.
  const response = await api.get(`/inbox/visitors/${visitorId}`);
  return response.data;
};

const sendAgentReply = async (
  payload: SendMessagePayload
): Promise<Message> => {
  const response = await api.post(
    `/inbox/conversations/${payload.conversationId}/messages`,
    {
      text: payload.text,
    }
  );
  return response.data;
};

// --- Custom Hooks ---

export const useGetConversations = (projectId?: number) => {
  return useQuery({
    queryKey: ["conversations", projectId],
    queryFn: () => {
      if (!projectId) return { data: [], total: 0, page: 1, limit: 10 }; // Trả về cấu trúc mặc định
      return getConversationsByProjectId(projectId);
    },
    enabled: !!projectId,
  });
};

export const useGetMessages = (conversationId?: number) => {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId,
  });
};

export const useGetVisitor = (visitorId?: number) => {
  return useQuery({
    queryKey: ["visitor", visitorId],
    queryFn: () => getVisitorById(visitorId!),
    enabled: !!visitorId,
  });
};

export const useSendAgentReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendAgentReply,
    onMutate: async (newMessagePayload: SendMessagePayload) => {
      const queryKey = ["messages", newMessagePayload.conversationId];
      await queryClient.cancelQueries({ queryKey });

      const optimisticMessage: Message = {
        id: uuidv4(),
        conversationId: newMessagePayload.conversationId,
        content: newMessagePayload.text,
        status: "sending",
        fromCustomer: false,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Message[]>(queryKey, (oldData = []) => [
        ...oldData,
        optimisticMessage,
      ]);

      return { optimisticMessageId: optimisticMessage.id };
    },
    onSuccess: (finalMessage, variables, context) => {
      const queryKey = ["messages", variables.conversationId];
      queryClient.setQueryData<Message[]>(queryKey, (oldData = []) =>
        oldData.map((msg) =>
          msg.id === context?.optimisticMessageId ? finalMessage : msg
        )
      );
    },
    onError: (_err, variables, context) => {
      const queryKey = ["messages", variables.conversationId];
      queryClient.setQueryData<Message[]>(queryKey, (oldData = []) =>
        oldData.map((msg) =>
          msg.id === context?.optimisticMessageId
            ? { ...msg, status: "failed" }
            : msg
        )
      );
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId],
      });
      // Invalidate conversations to update last message snippet
      // We need projectId here, which should be passed down to MessageComposer or retrieved differently
      // queryClient.invalidateQueries({ queryKey: ['conversations', projectId] });
    },
  });
};

export const useUpdateConversationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateConversationStatus,
    onSuccess: () => {
      // Làm mới lại danh sách conversations để cập nhật giao diện
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
