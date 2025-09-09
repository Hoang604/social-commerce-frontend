// src/widget/services/webSocketService.ts
import { useChatStore } from "../store/useChatStore";

const WEBSOCKET_URL = (
  import.meta.env.VITE_API_BASE_URL || "ws://localhost:3000"
).replace(/^http/, "ws");

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;

  public connect(projectId: string, visitorUid: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    const {
      setConnectionStatus,
      loadConversationHistory,
      addMessage,
      setAgentTyping,
    } = useChatStore.getState();
    setConnectionStatus("connecting");

    this.socket = new WebSocket(WEBSOCKET_URL);

    this.socket.onopen = () => {
      console.log("WebSocket connection established.");
      setConnectionStatus("connected");
      this.reconnectAttempts = 0;
      this.sendMessage("identify", { projectId, visitorUid });
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!data.event) return;

        switch (data.event) {
          case "conversationHistory":
            loadConversationHistory(data.payload.messages);
            break;
          case "agentReply":
            addMessage({ ...data.payload, status: "sent" });
            // Mở cửa sổ chat và tăng unread count nếu cửa sổ đang đóng
            if (!useChatStore.getState().isWindowOpen) {
              useChatStore.getState().incrementUnreadCount();
            }
            break;
          case "agentTyping":
            setAgentTyping(data.payload.isTyping);
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.socket.onerror = (error) => console.error("WebSocket Error:", error);

    this.socket.onclose = () => {
      console.log("WebSocket connection closed.");
      setConnectionStatus("disconnected");
      const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
      this.reconnectAttempts++;
      setTimeout(() => this.connect(projectId, visitorUid), delay);
    };
  }

  public sendMessage(event: string, payload: unknown) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, payload }));
    }
  }

  public close() {
    if (this.socket) {
      this.socket.onclose = null; // Prevent reconnection on manual close
      this.socket.close();
    }
  }
}

// Export a singleton instance
export const webSocketService = new WebSocketService();
