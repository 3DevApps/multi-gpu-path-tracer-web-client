import React, { useState, useEffect, useCallback } from "react";
import "./RenderStream.css";
import { useWebSocketConnection } from "../hooks/useWebSocketConnection";

function useMouseHandler() {
  const { sendMessage } = useWebSocketConnection();
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

  return { handleMouseDown, handleMouseMove };
}

function useKeyPressHandler() {
  const { sendMessage } = useWebSocketConnection();

  const onKeyPress = useCallback((event: KeyboardEvent) => {
    const key = event.key.toUpperCase();
    switch (key) {
      case "W":
        sendMessage(["CAMERA_CHANGE", "FORWARD"]);
        break;
      case "A":
        sendMessage(["CAMERA_CHANGE", "LEFT"]);
        break;
      case "S":
        sendMessage(["CAMERA_CHANGE", "BACKWARD"]);
        break;
      case "D":
        sendMessage(["CAMERA_CHANGE", "RIGHT"]);
        break;
      case "[":
        event.ctrlKey && sendMessage(["CAMERA_CHANGE", "FOV-"]);
        break;
      case "]":
        event.ctrlKey && sendMessage(["CAMERA_CHANGE", "FOV+"]);
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keypress", onKeyPress);

    return () => {
      window.removeEventListener("keypress", onKeyPress);
    };
  }, [onKeyPress]);
}

export default function RenderStream() {
  useKeyPressHandler();
  const { renderData } = useWebSocketConnection();
  const { handleMouseDown, handleMouseMove } = useMouseHandler();

  return (
    <section onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
      {renderData && (
        <img src={URL.createObjectURL(renderData)} alt="renderStream" />
      )}
    </section>
  );
}
