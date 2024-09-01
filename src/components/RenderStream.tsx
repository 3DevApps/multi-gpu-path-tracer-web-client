import React, { useEffect } from "react";
import "./RenderStream.css";
import { useWebSocketConnection } from "../hooks/useWebSocketConnection";

export default function RenderStream() {
  const { lastMessage } = useWebSocketConnection();
  const [renderData, setRenderData] = React.useState<any>(null);

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
    <section>
      {renderData && (
        <img src={URL.createObjectURL(renderData)} alt="renderStream" />
      )}
    </section>
  );
}
