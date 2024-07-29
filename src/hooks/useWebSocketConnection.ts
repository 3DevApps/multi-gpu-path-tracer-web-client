import config from "../config/config";
import useWebSocket from "react-use-websocket";

export function useWebSocketConnection() {
  return useWebSocket(config.WS_SERVER_URL, {
    share: true,
  });
}
