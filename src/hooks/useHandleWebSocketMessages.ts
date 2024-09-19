import { useContext, useEffect, useState } from "react";
import { RenderStatistics } from "../components/RenderStatistics";
import { WebsocketContext } from "../contexts/WebsocketContext";

export function useHandleWebSocketMessages() {
  const { message, sendMessage } = useContext(WebsocketContext);
  const [renderStatistics, setRenderStatistics] = useState<RenderStatistics>(
    []
  );

  useEffect(() => {
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
  }, [message, sendMessage]);

  return { renderStatistics };
}
