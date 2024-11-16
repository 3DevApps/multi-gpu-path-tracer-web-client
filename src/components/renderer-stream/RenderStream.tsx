import React, {
  useEffect,
  useCallback,
  MouseEventHandler,
  useRef,
  useContext,
} from "react";
import "./RenderStream.css";
import { useWebSocketConnection } from "../../hooks/useWebSocketConnection";
import { useMouseHandler } from "../../hooks/useMouseHandler";
import { PathTracerParamsContext } from "../../contexts/PathTracerParamsContext";
import { VideoStreamManager } from "../../utils/VideoStreamManager";
import { JobSettingsContext } from "../../contexts/JobSettingsContext";

const MAX_SPEED = 100;
const SPEED_INCREMENT = 45 / 40;

function useKeyPressHandler() {
  const { sendMessage } = useWebSocketConnection();
  const { moveSpeed } = useContext(PathTracerParamsContext);
  const moveSpeedInternal = React.useRef(moveSpeed.toString());
  const initialKeyPressTimeoutMap = React.useRef<any>({});
  const keyPressIntervalMap = React.useRef<any>({});

  useEffect(() => {
    moveSpeedInternal.current = moveSpeed.toString();
  }, [moveSpeed]);

  // deprecated: speed is now controlled by the slider
  const increaseSpeed = useCallback(() => {
    const newSpeed = parseFloat(moveSpeedInternal.current) + SPEED_INCREMENT;
    moveSpeedInternal.current =
      newSpeed > MAX_SPEED ? MAX_SPEED.toString() : newSpeed.toString();
  }, []);

  const keyPressHandler = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      // increaseSpeed();
      switch (key) {
        case "W":
          sendMessage(["CAMERA_EVENT", "FORWARD", moveSpeedInternal.current]);
          break;
        case "A":
          sendMessage(["CAMERA_EVENT", "LEFT", moveSpeedInternal.current]);
          break;
        case "S":
          sendMessage(["CAMERA_EVENT", "BACKWARD", moveSpeedInternal.current]);
          break;
        case "D":
          sendMessage(["CAMERA_EVENT", "RIGHT", moveSpeedInternal.current]);
          break;
        case "Q":
          sendMessage(["CAMERA_EVENT", "DOWN", moveSpeedInternal.current]);
          break;
        case "E":
          sendMessage(["CAMERA_EVENT", "UP", moveSpeedInternal.current]);
          break;
        case "[":
          event.ctrlKey && sendMessage(["CAMERA_EVENT", "FOV-"]);
          break;
        case "]":
          event.ctrlKey && sendMessage(["CAMERA_EVENT", "FOV+"]);
          break;
        default:
          break;
      }
    },
    [moveSpeedInternal, sendMessage, increaseSpeed]
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

    // moveSpeedInternal.current = MIN_SPEED.toString();
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

function useFrameHandler(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const streamManager = useRef<VideoStreamManager | null>(null);
  const { jobId } = useContext(JobSettingsContext);
  const { width, height } = useContext(PathTracerParamsContext);

  useEffect(() => {
    if (canvasRef.current !== null && streamManager.current === null && jobId) {
      streamManager.current = new VideoStreamManager(jobId, canvasRef.current);
    }
  }, [canvasRef.current, jobId]);

  useEffect(() => {
    streamManager.current?.resize(width, height);
  }, [width, height]);
}

export default function RenderStream() {
  useKeyPressHandler();
  const { sendMessage } = useWebSocketConnection();
  const { width, height } = useContext(PathTracerParamsContext);

  const mouseMoveHandler: MouseEventHandler<HTMLElement> = useCallback(
    (e) => {
      const { movementX, movementY } = e;
      sendMessage(["MOUSE_MOVE", movementX.toString(), movementY.toString()]);
    },
    [sendMessage]
  );
  const { handleMouseDown, handleMouseMove } =
    useMouseHandler(mouseMoveHandler);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useFrameHandler(canvasRef);

  return (
    <section onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
      <canvas
        id="renderCanvas"
        ref={canvasRef}
        width={width}
        height={height}
      ></canvas>
    </section>
  );
}
