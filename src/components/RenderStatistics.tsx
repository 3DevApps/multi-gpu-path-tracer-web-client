import React, { useCallback, useMemo, useState } from "react";
import "./RenderStatistics.css";
import { LeftOutlined } from "@ant-design/icons";

export default function RenderStatistics() {
  const [asideStyle, setAsideStyle] = useState({ right: -350 });
  const closeButtonStyle = useMemo(
    () => ({
      transform: `rotate(${asideStyle.right === 0 ? 180 : 0}deg)`,
      left: asideStyle.right === 0 ? 0 : "-2.5rem",
    }),
    [asideStyle]
  );

  const toggleAside = useCallback(() => {
    setAsideStyle((prev) => ({
      right: prev.right === 0 ? -350 : 0,
    }));
  }, []);

  return (
    <aside className="render-statistics" style={asideStyle}>
      <div className="scrollable-content">
        <h2>Render statistics</h2>

        <p>TODO: show charts</p>

        <div className="toggle-button close-button" onClick={toggleAside}>
          <LeftOutlined
            className="close-button-icon"
            style={closeButtonStyle}
          />
        </div>
      </div>
    </aside>
  );
}
