import { useEffect, useState } from "react";
import { useWebSocketConnection } from "./useWebSocketConnection";
import { parseMessage } from "../utils/webSocketMessageFormat";
import { RenderStatistics } from "../components/RenderStatistics";

export function useHandleWebSocketMessages() {
  const { lastMessage, sendMessage } = useWebSocketConnection();
  const [renderStatistics, setRenderStatistics] = useState<RenderStatistics>([]);

  useEffect(() => {
    if (!lastMessage || lastMessage.data instanceof Blob) {
      return;
    }
    const message = parseMessage(lastMessage.data);
    if (!message) {
      return;
    }
    const type = message[0];
    switch (type) {
      case "RENDER_STATS":
        setRenderStatistics(message.splice(1));
        break;
      case "JOB_ID":
        const url = new URL(window.location.href);
        url.searchParams.set("jobId", message[1]);
        window.history.pushState(null, "", url.toString());
        break;

      default:
        break;
    }
  }, [lastMessage, sendMessage]);

  return { renderStatistics };
}
