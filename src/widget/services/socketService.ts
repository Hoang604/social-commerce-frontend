// src/widget/services/socketService.ts
import { io, Socket } from "socket.io-client";
import { useChatStore } from "../store/useChatStore";
import { type Message } from "../types";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

class SocketService {
  private socket: Socket | null = null;

  // Phương thức kết nối và lắng nghe sự kiện
  public connect(projectId: string, visitorUid: string): void {
    if (this.socket?.connected) return;

    const {
      setConnectionStatus,
      loadConversationHistory,
      addMessage,
      setAgentIsTyping,
      incrementUnreadCount,
    } = useChatStore.getState();
    setConnectionStatus("connecting");

    this.socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
    });

    // --- Lắng nghe các sự kiện từ Server ---

    this.socket.on("connect", () => {
      console.log("Socket.IO connected:", this.socket?.id);
      setConnectionStatus("connected");
      // Gửi sự kiện định danh ngay sau khi kết nối
      this.socket?.emit("identify", { projectId, visitorUid });
    });

    this.socket.on("disconnect", () => {
      console.log("Socket.IO disconnected");
      setConnectionStatus("disconnected");
    });

    this.socket.on("conversationHistory", (data: { messages: Message[] }) => {
      loadConversationHistory(data.messages);
    });

    this.socket.on("agentReply", (newMessage: Message) => {
      addMessage(newMessage);
      if (!useChatStore.getState().isWindowOpen) {
        incrementUnreadCount();
      }
    });

    this.socket.on(
      "agentIsTyping",
      (data: { agentName: string; isTyping: boolean }) => {
        setAgentIsTyping(data.isTyping);
      }
    );
  }

  // --- Các phương thức để gửi sự kiện lên Server ---

  public emitSendMessage(content: string): void {
    this.socket?.emit("sendMessage", { content });
  }

  public emitVisitorIsTyping(isTyping: boolean): void {
    this.socket?.emit("visitorIsTyping", { isTyping });
  }

  public disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}

// Xuất khẩu một instance duy nhất (singleton) để toàn bộ widget sử dụng
export const socketService = new SocketService();
