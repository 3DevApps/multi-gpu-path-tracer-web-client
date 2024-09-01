import React, { useEffect, useRef } from "react";
import "./RenderStream.css";
import { useWebSocketConnection } from "../hooks/useWebSocketConnection";
import { parseMessage } from "../utils/webSocketMessageFormat";

export default function RenderStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { lastMessage } = useWebSocketConnection();
  const [renderData, setRenderData] = React.useState<any>(null);

  useEffect(() => {
    if (lastMessage !== null) {
      const parsedMessage = parseMessage(lastMessage.data);
      if (parsedMessage && parsedMessage[0] === "RENDER" && parsedMessage[1]) {
        setRenderData(parsedMessage[1]);
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !renderData) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    // TODO: get proper image resolution from somewhere
    const width = 1600;
    const height = 900;

    canvas.width = width;
    canvas.height = height;
    const imageData = ctx.createImageData(width, height);
    const data = renderData.split(",");

    let dataIndex = 0;
    for (let i = 0; i < width * height; i++) {
        const baseIdx = i * 4;
        imageData.data[baseIdx] = data[dataIndex++];
        imageData.data[baseIdx + 1] = data[dataIndex++];
        imageData.data[baseIdx + 2] = data[dataIndex++];
        imageData.data[baseIdx + 3] = 255; // Fully opaque
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
  }, [renderData]);

  return (
    <section>
      <canvas ref={canvasRef}></canvas>
    </section>
  );
}
