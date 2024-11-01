import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import "./RenderStatistics.css";
import { LeftOutlined } from "@ant-design/icons";
import { useMouseHandler } from "../hooks/useMouseHandler";
import Chart from "./Chart";

export type RenderStatistics = string[];

export type RenderStatisticsProps = {
  renderStatistics: RenderStatistics;
};

export default function RenderStatisticsComponent({
  renderStatistics,
}: RenderStatisticsProps) {
  const [asideStyle, setAsideStyle] = useState({
    width: 350,
    right: -350,
    transition: "0s",
  });
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
      width: 350,
      transition: "0.3s",
    }));
    setTimeout(() => {
      setAsideStyle((prev) => ({
        ...prev,
        transition: "0s",
      }));
    }, 310);
  }, []);

  const mouseMoveHandler: MouseEventHandler<HTMLElement> = useCallback((e) => {
    e.preventDefault();
    const { clientX } = e;
    const newWidth = window.innerWidth - clientX;
    if (newWidth < 350) {
      return;
    }
    setAsideStyle((prev) => ({
      ...prev,
      width: newWidth,
    }));
  }, []);
  const { handleMouseDown, handleMouseMove } =
    useMouseHandler(mouseMoveHandler);

  useEffect(() => {
    // @ts-ignore
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      // @ts-ignore
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  const resolvedRenderStatistics = useMemo(() => {
    if (!renderStatistics.length) return null;

    const categories = renderStatistics[0].split("|");
    const values = renderStatistics.slice(1).map((value) => value.split("|"));

    return values.map((value, index) => {
      return (
        <div key={index} className="render-statistics-category">
          <h3>GPU #{value[0]}</h3>
          <ul>
            {value.slice(1).map((item, index) => (
              <li key={index}>
                <b>{categories[index + 1]}</b>: {item}
              </li>
            ))}
          </ul>
        </div>
      );
    });
  }, [renderStatistics]);

  return (
    <aside className="render-statistics" style={asideStyle}>
      <div className="resize-section" onMouseDown={handleMouseDown} />
      <div className="scrollable-content">
        <h2 className="header">Render statistics</h2>
        <Chart />
        {resolvedRenderStatistics ? (
          resolvedRenderStatistics
        ) : (
          <p>No statistics available</p>
        )}
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
