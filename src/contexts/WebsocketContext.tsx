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
import { getFormattedDateTime } from "../utils/getFormattedDate";

type WebsocketContextType = {
  message: string[] | null;
  renderData: Blob | null;
  sendMessage: (message: string[]) => void;
  framesCount: React.MutableRefObject<number>;
};

export const WebsocketContext = createContext({} as WebsocketContextType);

export const WebsocketContextProvider = ({ children }: any) => {
  const [message, setMessage] = useState<string[] | null>(null);
  const [renderData] = useState<Blob | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const framesCount = useRef(0);

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
        if (text.startsWith("SNAPSHOT#")) {
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
    <WebsocketContext.Provider
      value={{ message, renderData, sendMessage, framesCount }}
    >
      {children}
    </WebsocketContext.Provider>
  );
};
