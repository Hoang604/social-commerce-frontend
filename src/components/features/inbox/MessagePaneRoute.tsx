import { useParams } from "react-router-dom";
import MessagePane from "./MessagePane";

const MessagePaneRoute = () => {
  const { conversationId } = useParams<{ conversationId: string }>();

  return <MessagePane conversationId={conversationId || null} />;
};

export default MessagePaneRoute;
