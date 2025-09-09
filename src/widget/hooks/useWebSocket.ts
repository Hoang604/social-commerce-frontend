// src/widget/hooks/useWebSocket.ts
import { useEffect } from "preact/hooks";
import { webSocketService } from "../services/webSocketService";

interface UseWebSocketProps {
  projectId?: string;
  visitorUid?: string;
}

export const useWebSocket = ({ projectId, visitorUid }: UseWebSocketProps) => {
  useEffect(() => {
    if (projectId && visitorUid) {
      webSocketService.connect(projectId, visitorUid);
    }
    // Cleanup on unmount
    return () => {
      webSocketService.close();
    };
  }, [projectId, visitorUid]);
};
