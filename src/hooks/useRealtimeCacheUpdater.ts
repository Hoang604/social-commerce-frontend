// src/hooks/useRealtimeCacheUpdater.ts (new or heavily refactored file)

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "../contexts/SocketContext"; // Assuming a socket context

export const useRealtimeCacheUpdater = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !socket.socket) return;

    const handleNewMessage = (newMessage: any) => {
      const { conversationId, projectId } = newMessage;

      // 1. Update the message list for the specific conversation
      queryClient.setQueryData(["messages", conversationId], (oldData: any) => {
        return oldData ? [...oldData, newMessage] : [newMessage];
      });

      // 2. Update the conversation list to bring the conversation to the top
      queryClient.setQueryData(
        ["conversations", projectId.toString()],
        (oldData: any[]) => {
          if (!oldData) return [];
          const updatedConvo = oldData.find((c) => c.id === conversationId);
          if (updatedConvo) {
            updatedConvo.lastMessageSnippet = newMessage.content;
            // Filter out the updated convo and place it at the beginning
            return [
              updatedConvo,
              ...oldData.filter((c) => c.id !== conversationId),
            ];
          }
          return oldData;
        }
      );
    };

    const handleVisitorContextUpdate = (update: {
      visitorId: number;
      currentUrl: string;
    }) => {
      // 3. Update the specific visitor's cache
      queryClient.setQueryData(
        ["visitor", update.visitorId],
        (oldData: any) => {
          if (!oldData) return update;
          return { ...oldData, currentUrl: update.currentUrl };
        }
      );
    };

    socket.socket.on("new_message_from_visitor", handleNewMessage);
    socket.socket.on("visitor_context_update", handleVisitorContextUpdate);

    return () => {
      if (socket?.socket) {
        socket.socket.off("new_message_from_visitor", handleNewMessage);
        socket.socket.off("visitor_context_update", handleVisitorContextUpdate);
      }
    };
  }, [socket, queryClient]);
};
