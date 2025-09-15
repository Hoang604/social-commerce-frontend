// src/contexts/SocketContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../stores/authStore";
import { useQueryClient } from "@tanstack/react-query";
import type { Message } from "../services/inboxApi"; // Import types từ inboxApi

// --- Real-time cache update hook ---
const useRealtimeCacheUpdater = (socket: Socket | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    // General handler for new messages (from visitor or other agent)
    const handleNewMessage = (newMessage: Message) => {
      const conversationId = newMessage.conversationId;

      // 1. Update message list cache
      queryClient.setQueryData<Message[]>(
        ["messages", conversationId],
        (oldData) => {
          if (!oldData) return [newMessage];

          // Anti-duplication: If the message already exists in the cache, do nothing
          if (oldData.some((msg) => msg.id === newMessage.id)) {
            return oldData;
          }

          return [...oldData, newMessage];
        }
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    // Listen for visitor typing event
    const handleVisitorTyping = (payload: {
      conversationId: number;
      isTyping: boolean;
    }) => {
      // TODO: Update UI to display "Visitor is typing..." indicator
      // Example: setTypingStatus(payload.conversationId, payload.isTyping)
      console.log(
        `Visitor in convo ${payload.conversationId} is typing: ${payload.isTyping}`
      );
    };

    // Register to listen for events with agreed-upon names
    socket.on("newMessage", handleNewMessage); // Event when there is a new message from visitor
    socket.on("agentReplied", handleNewMessage); // Event when another agent replies
    socket.on("visitorIsTyping", handleVisitorTyping); // Event when visitor is typing

    // Clean up when component unmounts
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("agentReplied", handleNewMessage);
      socket.off("visitorIsTyping", handleVisitorTyping);
    };
  }, [socket, queryClient]);
};

// --- Context, Provider, and useSocket Hook ---
interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);

  useRealtimeCacheUpdater(socket);

  useEffect(() => {
    // Only create connection when accessToken is available
    if (accessToken) {
      console.log("Establishing socket connection with token:", accessToken);
      const newSocket = io(import.meta.env.VITE_API_URL, {
        // autoConnect: false, // Should allow auto-connect
        auth: {
          token: accessToken,
        },
      });

      setSocket(newSocket);

      newSocket.on("connect", () =>
        console.log("Socket connected:", newSocket.id)
      );
      newSocket.on("disconnect", (reason) =>
        console.log("Socket disconnected:", reason)
      );

      // Clean up old connection when component unmounts or accessToken changes
      return () => {
        newSocket.disconnect();
      };
    } else {
      // If no token (logout), ensure socket is disconnected and cleaned up
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [accessToken]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
