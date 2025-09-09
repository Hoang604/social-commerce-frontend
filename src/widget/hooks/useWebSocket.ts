// src/widget/hooks/useWebSocket.ts
import { useEffect, useRef } from "preact/hooks";
import { useChatStore } from "../store/useChatStore";

interface UseWebSocketProps {
  projectId: string;
  visitorUid: string;
}

const WEBSOCKET_URL = (
  import.meta.env.VITE_API_BASE_URL || "ws://localhost:3000"
).replace(/^http/, "ws");

/**
 * A custom hook to manage the WebSocket connection lifecycle for the chat widget.
 * It handles connection, disconnection, message passing, and automatic reconnection.
 * @param props - The properties required for the WebSocket connection.
 */
export const useWebSocket = ({ projectId, visitorUid }: UseWebSocketProps) => {
  const {
    setConnectionStatus,
    loadConversationHistory,
    addMessage,
    setAgentTyping,
    updateMessageStatus,
  } = useChatStore.getState();

  // Use useRef for socket instance and reconnect attempts to persist across renders
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    if (!projectId || !visitorUid) {
      return;
    }

    const connect = () => {
      setConnectionStatus("connecting");
      const socket = new WebSocket(WEBSOCKET_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connection established.");
        setConnectionStatus("connected");
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection

        // Immediately identify the visitor to the server
        socket.send(
          JSON.stringify({
            event: "identify",
            payload: { projectId, visitorUid },
          })
        );
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data.event) return;

          switch (data.event) {
            case "conversationHistory":
              loadConversationHistory(data.payload.messages);
              break;
            case "agentReply":
              addMessage({ ...data.payload, status: "sent" });
              break;
            case "agentTyping":
              setAgentTyping(data.payload.isTyping);
              break;
            case "messageAck":
              updateMessageStatus(data.payload.tempId, "sent");
              break;
            default:
              break;
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed.");
        setConnectionStatus("disconnected");

        // Exponential backoff reconnection logic
        const attempts = reconnectAttemptsRef.current;
        const delay = Math.min(1000 * 2 ** attempts, 30000); // Max 30 seconds

        console.log(`Attempting to reconnect in ${delay / 1000}s...`);

        setTimeout(() => {
          reconnectAttemptsRef.current = attempts + 1;
          connect();
        }, delay);
      };
    };

    connect();

    // Cleanup function to close the connection when the component unmounts
    return () => {
      if (socketRef.current) {
        // Remove the onclose listener before closing to prevent reconnection attempts on unmount
        socketRef.current.onclose = null;
        socketRef.current.close();
      }
    };
  }, [projectId, visitorUid]); // Rerun effect if projectId or visitorUid changes
};
