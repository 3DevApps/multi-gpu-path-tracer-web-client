import { useEffect } from "react";
import { useWebSocketConnection } from "./useWebSocketConnection";

const parseMessage = (message: string) => {
  try {
    return message.split("#");
  } catch (error) {
    console.error("Failed to parse message:", message);
    return null;
  }
};

export function useHandleWebSocketMessages() {
  const { lastMessage, sendMessage } = useWebSocketConnection();

  useEffect(() => {
    if (!lastMessage) {
      return;
    }
    const message = parseMessage(lastMessage.data);
    if (!message) {
      return;
    }
    const type = message[0];
    switch (type) {
      case "JOB_ID":
        const url = new URL(window.location.href);
        url.searchParams.set("jobId", message[1]);
        window.history.pushState(null, "", url.toString());
        break;

      default:
        break;
    }
  }, [lastMessage, sendMessage]);
}
