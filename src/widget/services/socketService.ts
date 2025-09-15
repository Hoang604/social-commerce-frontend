// src/widget/services/socketService.ts
import { io, Socket } from "socket.io-client";
import { useChatStore } from "../store/useChatStore";
import { type Message } from "../types";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

class SocketService {
  private socket: Socket | null = null;

  // Method to connect and listen for events
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

    // --- Listen for events from the Server ---

    this.socket.on("connect", () => {
      console.log("Socket.IO connected:", this.socket?.id);
      setConnectionStatus("connected");
      // Send identification event immediately after connecting
      this.socket?.emit("identify", { projectId, visitorUid });
    });

    this.socket.on("disconnect", () => {
      console.log("Socket.IO disconnected");
      setConnectionStatus("disconnected");
    });

    this.socket.on("conversationHistory", (data: { messages: Message[] }) => {
      console.log("DATA FROM conversationHistory:", data.messages);
      loadConversationHistory(data.messages);
    });

    this.socket.on("agentReplied", (newMessage: Message) => {
      console.log("New message from agent:", newMessage);
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

  // --- Methods to send events to the Server ---

  public emitSendMessage(content: string): void {
    this.socket?.emit("sendMessage", { content });
  }

  public emitVisitorIsTyping(isTyping: boolean): void {
    this.socket?.emit("visitorIsTyping", { isTyping });
  }

  public emitUpdateContext(currentUrl: string): void {
    if (this.socket?.connected) {
      this.socket.emit("updateContext", { currentUrl });
      console.log(`Context updated: ${currentUrl}`);
    }
  }

  public disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}

// Export a single instance (singleton) for the entire widget to use
export const socketService = new SocketService();
