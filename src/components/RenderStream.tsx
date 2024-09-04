import React, { useState, useEffect, useCallback } from "react";
import "./RenderStream.css";
import { useWebSocketConnection } from "../hooks/useWebSocketConnection";
import { encodeMessage } from "../utils/webSocketMessageFormat";

export default function RenderStream() {
  const { sendMessage, lastMessage } = useWebSocketConnection();
  const [renderData, setRenderData] = useState<any>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleMouseDown = useCallback(() => setIsMouseDown(true), []);
  const handleMouseUp = useCallback(() => setIsMouseDown(false), []);
  const handleMouseMove = useCallback(
    ({ clientX, clientY }: any) => {
      if (!isMouseDown) {
        return;
      }
      sendMessage(
        encodeMessage(["CLIENT_MESSAGE", "MOUSE_MOVE", clientX, clientY])
      );
    },
    [isMouseDown, sendMessage]
  );

  useEffect(() => {
    if (isMouseDown) {
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isMouseDown, handleMouseUp]);

  useEffect(() => {
    if (lastMessage !== null) {
      const rawData = lastMessage.data;

      // If the data is a Blob, it must be an image to render
      if (rawData instanceof Blob) {
        setRenderData(rawData);
        return;
      }
    }
  }, [lastMessage]);

  return (
    <section onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
      {renderData && (
        <img src={URL.createObjectURL(renderData)} alt="renderStream" />
      )}
    </section>
  );
}
