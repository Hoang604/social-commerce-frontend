// src/widget/App.tsx
import { useChatStore } from "./store/useChatStore";
import { Launcher } from "./components/Launcher";
import { ChatWindow } from "./components/ChatWindow";
import { socketService } from "./services/socketService";
import { type Message } from "./types";

const App = () => {
  // Nhiệm vụ 1: Lấy state từ store (đơn giản hơn)
  const {
    widgetConfig,
    isWindowOpen,
    messages,
    unreadCount,
    connectionStatus,
    isAgentTyping,
    toggleWindow,
    addMessage, // Giữ lại để dùng cho optimistic UI
    resetUnreadCount,
  } = useChatStore();

  // Nhiệm vụ 3: Đơn giản hóa các hàm xử lý
  const handleToggleWindow = () => {
    toggleWindow();
    if (!isWindowOpen) {
      resetUnreadCount();
    }
  };

  const handleSendMessage = (content: string) => {
    const tempId = crypto.randomUUID();
    const optimisticMessage: Message = {
      id: tempId,
      content,
      sender: { type: "visitor" },
      status: "sending",
      timestamp: new Date().toISOString(),
    };

    addMessage(optimisticMessage); // Cập nhật giao diện ngay lập tức

    socketService.emitSendMessage(content); // Gửi tin nhắn qua service

    // Bạn có thể thêm logic timeout/retry ở trong socketService nếu muốn
  };

  const handleTypingChange = (isTyping: boolean) => {
    socketService.emitVisitorIsTyping(isTyping); // Gửi trạng thái gõ qua service
  };

  // ... (phần render giữ nguyên) ...
  if (!widgetConfig) {
    return null;
  }

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
