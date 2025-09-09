// src/widget/App.tsx
import { useChatStore } from "./store/useChatStore";
import { useWebSocket } from "./hooks/useWebSocket";
import { Launcher } from "./components/Launcher";
import { ChatWindow } from "./components/ChatWindow";
import { webSocketService } from "./services/webSocketService";
import { type Message } from "./types";

const App = () => {
  // --- Nhiệm vụ 1: Kết nối với State Store ---
  const {
    widgetConfig,
    isWindowOpen,
    messages,
    unreadCount,
    connectionStatus,
    isAgentTyping,
    toggleWindow,
    addMessage,
    resetUnreadCount,
    updateMessageStatus,
  } = useChatStore();

  // --- Nhiệm vụ 2: Quản lý Tác vụ Nền ---
  const visitorUid = localStorage.getItem("visitor_uid");
  useWebSocket({
    projectId: widgetConfig?.projectId,
    visitorUid: visitorUid || undefined,
  });

  // --- Nhiệm vụ 3: Định nghĩa các Hàm Xử lý Sự kiện ---
  const handleToggleWindow = () => {
    toggleWindow();
    if (!isWindowOpen) {
      resetUnreadCount();
    }
  };

  const handleSendMessage = (content: string) => {
    const tempId = crypto.randomUUID();
    const newMessage: Message = {
      id: tempId,
      content,
      sender: { type: "visitor" },
      status: "sending",
      timestamp: new Date().toISOString(),
    };

    // Optimistic UI update
    addMessage(newMessage);

    // Send to server
    webSocketService.sendMessage("sendMessage", { content });

    // Fallback in case ack is not received
    setTimeout(() => {
      const msg = useChatStore.getState().messages.find((m) => m.id === tempId);
      if (msg && msg.status === "sending") {
        updateMessageStatus(tempId, "failed");
      }
    }, 5000);
  };

  const handleTypingChange = (isTyping: boolean) => {
    webSocketService.sendMessage("visitorTyping", { isTyping });
  };

  // --- Nhiệm vụ 2 (tiếp): Xử lý Trạng thái Tải ---
  if (!widgetConfig) {
    return null; // Don't render anything until config is loaded
  }

  // --- Nhiệm vụ 4: Lắp ráp Giao diện ---
  return (
    <>
      <ChatWindow
        isOpen={isWindowOpen}
        onClose={handleToggleWindow}
        config={widgetConfig}
        messages={messages}
        connectionStatus={connectionStatus}
        isAgentTyping={isAgentTyping}
        onSendMessage={handleSendMessage}
        onTypingChange={handleTypingChange}
      />
      <Launcher
        onClick={handleToggleWindow}
        unreadCount={unreadCount}
        primaryColor={widgetConfig.primaryColor}
      />
    </>
  );
};

export default App;
