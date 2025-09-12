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

// --- Hook cập nhật cache Real-time ---
const useRealtimeCacheUpdater = (socket: Socket | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    // Hàm xử lý chung cho tin nhắn mới (từ visitor hoặc agent khác)
    const handleNewMessage = (newMessage: Message) => {
      const conversationId = newMessage.conversationId;

      // 1. Cập nhật cache của danh sách tin nhắn
      queryClient.setQueryData<Message[]>(
        ["messages", conversationId],
        (oldData) => {
          if (!oldData) return [newMessage];

          // Chống trùng lặp: Nếu tin nhắn đã tồn tại trong cache thì không làm gì cả
          if (oldData.some((msg) => msg.id === newMessage.id)) {
            return oldData;
          }

          return [...oldData, newMessage];
        }
      );

      // 2. Làm mới danh sách hội thoại để cập nhật snippet và đưa lên đầu
      // InvalidateQueries sẽ tự động trigger một lần fetch mới
      // Chúng ta cần projectId để làm điều này, có thể lấy từ message object nếu backend trả về
      // Hoặc chúng ta có thể tìm trong cache của conversations
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    // Lắng nghe sự kiện visitor đang gõ
    const handleVisitorTyping = (payload: {
      conversationId: number;
      isTyping: boolean;
    }) => {
      // TODO: Cập nhật UI để hiển thị chỉ báo "Visitor is typing..."
      // Ví dụ: setTypingStatus(payload.conversationId, payload.isTyping)
      console.log(
        `Visitor in convo ${payload.conversationId} is typing: ${payload.isTyping}`
      );
    };

    // Đăng ký lắng nghe các sự kiện với tên đã được thống nhất
    socket.on("newMessage", handleNewMessage); // Sự kiện khi có tin mới từ visitor
    socket.on("agentReplied", handleNewMessage); // Sự kiện khi agent khác trả lời
    socket.on("visitorIsTyping", handleVisitorTyping); // Sự kiện khi visitor đang gõ

    // Dọn dẹp khi component unmount
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("agentReplied", handleNewMessage);
      socket.off("visitorIsTyping", handleVisitorTyping);
    };
  }, [socket, queryClient]);
};

// --- Context, Provider, và Hook useSocket ---
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
    // Chỉ tạo kết nối khi có accessToken
    if (accessToken) {
      const newSocket = io(import.meta.env.VITE_API_URL, {
        // autoConnect: false, // Nên để tự động kết nối
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

      // Dọn dẹp kết nối cũ khi component unmount hoặc accessToken thay đổi
      return () => {
        newSocket.disconnect();
      };
    } else {
      // Nếu không có token (logout), đảm bảo socket được ngắt và dọn dẹp
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
