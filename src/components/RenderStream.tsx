import React, { useEffect, useRef } from "react";
import "./RenderStream.css";

export default function RenderStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const imageData = ctx.createImageData(605, 349);

    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + 0] = 60; // R value
      imageData.data[i + 1] = 15; // G value
      imageData.data[i + 2] = 255; // B value
      imageData.data[i + 3] = 255; // A value
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
  }, []);

  return (
    <section>
      <canvas ref={canvasRef}></canvas>
    </section>
  );
}
