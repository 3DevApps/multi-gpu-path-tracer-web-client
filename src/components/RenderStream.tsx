import React, {
  useEffect,
  useCallback,
  MouseEventHandler,
  useRef,
  useContext,
} from "react";
import "./RenderStream.css";
import { useWebSocketConnection } from "../hooks/useWebSocketConnection";
import { useMouseHandler } from "../hooks/useMouseHandler";
import H264Decoder from "../utils/H264Decoder";
import { PathTracerParamsContext } from "../contexts/PathTracerParamsContext";

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

function useFrameHandler(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  renderData: Blob | null
) {
  const { width, height } = useContext(PathTracerParamsContext);
  const frameHandler = useCallback((frame: VideoFrame) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx!.drawImage(frame, 0, 0);
  }, []);

  const decoder = useRef<H264Decoder | null>(
    new H264Decoder(width, height, frameHandler)
  );

  useEffect(() => {
    decoder.current?.resetDecoder(width, height);
  }, [width, height]);

  useEffect(() => {
    const fn = async () => {
      if (!renderData) {
        return;
      }

      const arrayBuffer = await renderData.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      await decoder.current?.decode(uint8Array);
    };

    fn();
  }, [renderData]);
}

export default function RenderStream() {
  useKeyPressHandler();
  const { sendMessage, renderData } = useWebSocketConnection();
  const { width, height } = useContext(PathTracerParamsContext);

  const mouseMoveHandler: MouseEventHandler<HTMLElement> = useCallback((e) => {
    const { movementX, movementY } = e;
    sendMessage(["MOUSE_MOVE", movementX.toString(), movementY.toString()]);
  }, []);
  const { handleMouseDown, handleMouseMove } =
    useMouseHandler(mouseMoveHandler);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useFrameHandler(canvasRef, renderData);

  return (
    <section onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
      <canvas ref={canvasRef} width={width} height={height}></canvas>
    </section>
  );
}
