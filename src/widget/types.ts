export type MessageStatus = "sending" | "sent" | "failed";

export type MessageSender = {
  type: "visitor" | "agent";
  name?: string;
};

export type Message = {
  id: string | number; // Dùng string cho optimistic UI, number cho tin nhắn từ server
  content: string;
  sender: MessageSender;
  status: MessageStatus;
  timestamp: string;
};

export type WidgetConfig = {
  primaryColor: string;
  welcomeMessage: string;
};

export type ConnectionStatus = "connecting" | "connected" | "disconnected";
