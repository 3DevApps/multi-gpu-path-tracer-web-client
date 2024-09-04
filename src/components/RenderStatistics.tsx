import React, { useCallback, useMemo, useState } from "react";
import "./RenderStatistics.css";
import { LeftOutlined } from "@ant-design/icons";

export type RenderStatistics = string[];

export type RenderStatisticsProps = {
  renderStatistics: RenderStatistics;
};

export default function RenderStatisticsComponent({renderStatistics}: RenderStatisticsProps) {
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

  const resolvedRenderStatistics = useMemo(()=>{
    if(!renderStatistics.length) return null;

    const categories = renderStatistics[0].split("|");
    const values = renderStatistics.slice(1).map((value) => value.split("|"));
    
    return values.map((value, index) => {
      return (
        <div key={index} className="render-statistics-category">
          <h3>GPU #{value[0]}</h3>
          <ul>
            {value.slice(1).map((item, index) => (
              <li key={index}><b>{categories[index+1]}</b>: {item}</li>
            ))}
          </ul>
        </div>
      );
    }
    );
  }, [renderStatistics]);

  return (
    <aside className="render-statistics" style={asideStyle}>
      <div className="scrollable-content">
        <h2 className="header">Render statistics</h2>
        {resolvedRenderStatistics}
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
