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

export const WebsocketContext = createContext({} as WebsocketContextType);

export const WebsocketContextProvider = ({ children }: any) => {
  const [message, setMessage] = useState<string[] | null>(null);
  const [renderData, setRenderData] = useState<Blob | null>(null);
  const socket = useRef<WebSocket | null>(null);

  const webSocketUrl = useMemo(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("jobId")) {
      return `${config.WS_SERVER_URL}?jobId=${url.searchParams.get("jobId")}`;
    }
    return config.WS_SERVER_URL;
  }, []);

  useEffect(() => {
    socket.current = new WebSocket(webSocketUrl);
    socket.current.onopen = () =>
      console.log("WebSocket connection has been opened!");
    socket.current.onclose = () =>
      console.log("WebSocket connection has been closed!");
    socket.current.onmessage = (event) => {
      const rawData = event.data;
      // If the data is a Blob, it must be an image to render
      if (rawData instanceof Blob) {
        requestAnimationFrame(() => setRenderData(rawData));
        return;
      }
      setMessage(parseMessage(rawData));
    };
    return () => {
      socket.current?.close();
    };
  }, []);

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
