// src/widget/App.tsx
import { useChatStore } from "./store/useChatStore";
import { useWebSocket } from "./hooks/useWebSocket";

const App = () => {
  // Select state from the store
  const projectId = useChatStore((state) => state.widgetConfig?.projectId);

  // Visitor UID is retrieved directly as it's set during initialization
  const visitorUid = localStorage.getItem("visitor_uid");

  // Activate the WebSocket connection hook
  // The hook itself manages the connection lifecycle and doesn't return anything
  if (projectId && visitorUid) {
    useWebSocket({ projectId, visitorUid });
  }

  return (
    <div>
      {/* The UI components (Launcher, ChatWindow) will be added here in the next steps.
        They will react to state changes managed by the store, which is now
        being updated by the useWebSocket hook.
      */}
    </div>
  );
};

export default App;
