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
import H264Decoder from "../../utils/H264Decoder";
import { PathTracerParamsContext } from "../../contexts/PathTracerParamsContext";
import { StatisticsContext } from "../../contexts/StatisticsContext";
import { WebsocketContext } from "../../contexts/WebsocketContext";

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

function useFrameHandler(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  renderData: Blob | null
) {
  const { width, height } = useContext(PathTracerParamsContext);
  const { setFps, updateAverageFps } = useContext(StatisticsContext);
  const { framesCount } = useContext(WebsocketContext);
  const frames = useRef<number[]>([]);

  const frameHandler = useCallback(
    (frame: VideoFrame) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx!.drawImage(frame, 0, 0);

      // TODO: improve this
      const now = performance.now();
      const framesRef = frames.current;
      framesRef.push(now);
      while (framesRef.length > 0 && framesRef[0] < now - 1000) {
        framesRef.shift();
      }

      // setFps(framesRef.length);
      // updateAverageFps(framesRef.length);
    },
    [canvasRef, setFps, updateAverageFps]
  );

  const decoder = useRef<H264Decoder | null>(
    new H264Decoder(width, height, frameHandler, framesCount)
  );

  useEffect(() => {
    decoder.current?.resetDecoder(width, height);
  }, [width, height]);

  useEffect(() => {
    const fn = async () => {
      if (!renderData || decoder.current!.currentProcessedFrameCount > 1)
        return;
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
  useFrameHandler(canvasRef, renderData);

  return (
    <section onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
      <canvas ref={canvasRef} width={width} height={height}></canvas>
    </section>
  );
}
