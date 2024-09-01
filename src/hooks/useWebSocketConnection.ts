import { useMemo } from "react";
import config from "../config/config";
import useWebSocket from "react-use-websocket";

export function useWebSocketConnection() {
  const webSocketUrl = useMemo(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("jobId")) {
      return `${config.WS_SERVER_URL}?jobId=${url.searchParams.get("jobId")}`;
    }
    return config.WS_SERVER_URL;
  }, []);

  return useWebSocket(webSocketUrl, {
    share: true,
  });
}
