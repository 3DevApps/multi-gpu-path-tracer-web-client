import React, { useState, useEffect, useCallback } from "react";
import "./RenderStream.css";
import { useWebSocketConnection } from "../hooks/useWebSocketConnection";

export default function RenderStream() {
  const { sendMessage, renderData } = useWebSocketConnection();
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleMouseDown = useCallback(() => setIsMouseDown(true), []);
  const handleMouseUp = useCallback(() => setIsMouseDown(false), []);
  const handleMouseMove = useCallback(
    ({ clientX, clientY }: any) => {
      if (!isMouseDown) {
        return;
      }
      sendMessage(["MOUSE_MOVE", clientX, clientY]);
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

  return (
    <section onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
      {renderData && (
        <img src={URL.createObjectURL(renderData)} alt="renderStream" />
      )}
    </section>
  );
}
