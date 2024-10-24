import React, { useState, useEffect, useCallback } from "react";
import "./RenderStream.css";
import { useWebSocketConnection } from "../hooks/useWebSocketConnection";

function useMouseHandler() {
  const { sendMessage } = useWebSocketConnection();
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleMouseDown = useCallback(() => setIsMouseDown(true), []);
  const handleMouseUp = useCallback(() => setIsMouseDown(false), []);
  const handleMouseMove = useCallback(
    ({ movementX, movementY }: any) => {
      if (!isMouseDown) {
        return;
      }
      sendMessage(["MOUSE_MOVE", movementX, movementY]);
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

const MIN_SPEED = 5;
const MAX_SPEED = 50;
const SPEED_INCREMENT = (MAX_SPEED - MIN_SPEED) / 40;

function useKeyPressHandler() {
  const { sendMessage } = useWebSocketConnection();
  const moveSpeed = React.useRef(MIN_SPEED.toString());
  const initialKeyPressTimeoutMap = React.useRef<any>({});
  const keyPressIntervalMap = React.useRef<any>({});

  const increaseSpeed = useCallback(() => {
    const newSpeed = parseFloat(moveSpeed.current) + SPEED_INCREMENT;
    moveSpeed.current =
      newSpeed > MAX_SPEED ? MAX_SPEED.toString() : newSpeed.toString();
  }, []);

  const keyPressHandler = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      increaseSpeed();
      switch (key) {
        case "W":
          sendMessage(["KEYBOARD_EVENT", "FORWARD", moveSpeed.current]);
          break;
        case "A":
          sendMessage(["KEYBOARD_EVENT", "LEFT", moveSpeed.current]);
          break;
        case "S":
          sendMessage(["KEYBOARD_EVENT", "BACKWARD", moveSpeed.current]);
          break;
        case "D":
          sendMessage(["KEYBOARD_EVENT", "RIGHT", moveSpeed.current]);
          break;
        case "Q":
          sendMessage(["KEYBOARD_EVENT", "DOWN", moveSpeed.current]);
          break;
        case "E":
          sendMessage(["KEYBOARD_EVENT", "UP", moveSpeed.current]);
          break;
        case "[":
          event.ctrlKey && sendMessage(["KEYBOARD_EVENT", "FOV-"]);
          break;
        case "]":
          event.ctrlKey && sendMessage(["KEYBOARD_EVENT", "FOV+"]);
          break;
        default:
          break;
      }
    },
    [moveSpeed, sendMessage, increaseSpeed]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        keyPressIntervalMap.current[event.key] ||
        initialKeyPressTimeoutMap.current[event.key]
      ) {
        return;
      }
      keyPressHandler(event);
      initialKeyPressTimeoutMap.current[event.key] = setTimeout(() => {
        keyPressIntervalMap.current[event.key] = setInterval(() => {
          keyPressHandler(event);
        }, 50);
      }, 300);
    },
    [keyPressHandler]
  );

  const onKeyUp = useCallback((event: KeyboardEvent) => {
    clearInterval(keyPressIntervalMap.current[event.key]);
    delete keyPressIntervalMap.current[event.key];
    clearTimeout(initialKeyPressTimeoutMap.current[event.key]);
    delete initialKeyPressTimeoutMap.current[event.key];

    moveSpeed.current = MIN_SPEED.toString();
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [onKeyDown, onKeyUp]);
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
