// src/contexts/SocketContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../stores/authStore";
import { useQueryClient } from "@tanstack/react-query";

// --- Type Definitions for Payloads ---
// (These should ideally be in a shared types folder, e.g., src/types/socket.ts)
type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";
type CommentStatus = "sending" | "sent" | "failed" | "received";

interface Message {
  id: number | string; // Can be a temporary UUID string or a final number ID
  conversationId: string;
  content: string | null;
  attachments: any[] | null;
  senderId: string;
  fromCustomer: boolean;
  status: MessageStatus;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
}

interface Comment {
  id: number | string; // Can be a temporary UUID string or a final number ID
  facebookPostId: string;
  facebookCommentId: string | null;
  parentCommentId: number | null;
  content: string | null;
  senderId: string;
  fromCustomer: boolean;
  status: CommentStatus;
  createdAt: string; // ISO Date String
}

interface MessageStatusUpdate {
  id: number | string;
  conversationId: string;
  status: MessageStatus;
}

interface CommentStatusUpdate {
  id: number | string;
  facebookPostId: string;
  status: "sent" | "failed";
  facebookCommentId?: string; // Sent from backend on successful reply
}

// --- The Cache Updater Hook ---
const useRealtimeCacheUpdater = (socket: Socket | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: Message) => {
      queryClient.setQueryData(
        ["messages", newMessage.conversationId],
        (oldData: any) => {
          if (!oldData)
            return { pages: [[newMessage]], pageParams: [undefined] };

          // Idempotency check
          const messageExists = oldData.pages
            .flat()
            .some((msg: Message) => msg.id === newMessage.id);
          if (messageExists) return oldData;

          const newData = { ...oldData };
          newData.pages[0] = [newMessage, ...newData.pages[0]];
          return newData;
        }
      );
    };

    const handleMessageStatusUpdate = (update: MessageStatusUpdate) => {
      queryClient.setQueryData(
        ["messages", update.conversationId],
        (oldData: any) => {
          if (!oldData) return oldData;
          const newPages = oldData.pages.map((page: Message[]) =>
            page.map((msg) =>
              msg.id === update.id ? { ...msg, ...update } : msg
            )
          );
          return { ...oldData, pages: newPages };
        }
      );
    };

    const handleNewComment = (newComment: Comment) => {
      queryClient.setQueryData(
        ["comments", newComment.facebookPostId],
        (oldData: any) => {
          if (!oldData)
            return { pages: [[newComment]], pageParams: [undefined] };

          // Idempotency check
          const commentExists = oldData.pages
            .flat()
            .some((c: Comment) => c.id === newComment.id);
          if (commentExists) return oldData;

          const newData = { ...oldData };
          newData.pages[0] = [newComment, ...newData.pages[0]];
          return newData;
        }
      );
    };

    const handleCommentStatusUpdate = (update: CommentStatusUpdate) => {
      queryClient.setQueryData(
        ["comments", update.facebookPostId],
        (oldData: any) => {
          if (!oldData) return oldData;
          const newPages = oldData.pages.map((page: Comment[]) =>
            page.map((c) => (c.id === update.id ? { ...c, ...update } : c))
          );
          return { ...oldData, pages: newPages };
        }
      );
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:status:updated", handleMessageStatusUpdate);
    socket.on("comment:created", handleNewComment);
    socket.on("comment:updated", handleCommentStatusUpdate);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:status:updated", handleMessageStatusUpdate);
      socket.off("comment:created", handleNewComment);
      socket.off("comment:updated", handleCommentStatusUpdate);
    };
  }, [socket, queryClient]);
};

// --- The Context and Provider ---
interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { accessToken } = useAuthStore.getState();

  // This hook will listen for events and update the cache
  useRealtimeCacheUpdater(socket);

  useEffect(() => {
    if (accessToken) {
      const newSocket = io(import.meta.env.VITE_API_URL, {
        autoConnect: false,
        auth: {
          token: accessToken,
        },
      });

      setSocket(newSocket);

      newSocket.connect();

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [accessToken]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
