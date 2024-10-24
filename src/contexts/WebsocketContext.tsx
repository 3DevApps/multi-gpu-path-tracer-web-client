import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import config from "../config/config";
import { encodeMessage, parseMessage } from "../utils/webSocketMessageFormat";

type WebsocketContextType = {
  message: string[] | null;
  renderData: Blob | null;
  sendMessage: (message: string[]) => void;
};

function getFormattedDateTime() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

export const WebsocketContext = createContext({} as WebsocketContextType);

export const WebsocketContextProvider = ({ children }: any) => {
  const [message, setMessage] = useState<string[] | null>(null);
  const [renderData, setRenderData] = useState<Blob | null>(null);
  const socket = useRef<WebSocket | null>(null);

  const webSocketUrl = useMemo(
    () => `${config.WS_SERVER_URL}${window.location.search}`,
    []
  );

  useEffect(() => {
    socket.current = new WebSocket(webSocketUrl);
    socket.current.onopen = () =>
      console.log("WebSocket connection has been opened!");
    socket.current.onclose = () =>
      console.log("WebSocket connection has been closed!");
    socket.current.onmessage = async (event) => {
      const rawData = event.data;
      if (rawData instanceof Blob) {
        // Read first 10 bytes to determine the message type
        const text = await rawData.slice(0, 10).text();
        if (text.startsWith("RENDER#")) {
          requestAnimationFrame(() => setRenderData(rawData.slice(7)));
        } else if (text.startsWith("SNAPSHOT#")) {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(rawData.slice(9));
          a.download = `view-${getFormattedDateTime()}.png`;
          a.click();
        }
        return;
      }
      setMessage(parseMessage(rawData));
    };

    document.addEventListener("beforeunload", () => {
      socket.current?.close();
    });
  }, [webSocketUrl]);

  const sendMessage = useCallback((message: string[]) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(encodeMessage(message));
    }
  }, []);

  return (
    <WebsocketContext.Provider value={{ message, renderData, sendMessage }}>
      {children}
    </WebsocketContext.Provider>
  );
};
