import {
  MouseEventHandler,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./RenderStatistics.css";
import {
  CaretDownOutlined,
  LeftOutlined,
  SaveOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useMouseHandler } from "../../hooks/useMouseHandler";
import Chart from "./Chart";
import { StatisticsContext } from "../../contexts/StatisticsContext";
import { Button, Dropdown, Flex, Space } from "antd";
import { JobSettingsContext } from "../../contexts/JobSettingsContext";
import ChartAnalysis from "./ChartAnalysis";
import {
  downloadCSV,
  getFilteredData,
  storeDataPoint,
} from "./statisticsDataUtils";

export type RenderStatistics = string[];

export type RenderStatisticsProps = {
  renderStatistics: RenderStatistics;
};

export default function RenderStatisticsComponent({
  renderStatistics,
}: RenderStatisticsProps) {
  const [asideStyle, setAsideStyle] = useState({
    width: 450,
    right: -450,
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
      right: prev.right === 0 ? -450 : 0,
      width: 450,
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
    if (newWidth < 450) {
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

  const categorizedEntries: any = useRef({}).current;
  useEffect(() => {
    if (!renderStatistics.length) {
      return;
    }

    const entries = renderStatistics[0].split("|");
    const timestamp = Date.now();
    for (let i = 0; i < entries.length; i += 3) {
      const category = entries[i];
      const name = entries[i + 1];
      const value = entries[i + 2];
      if (!category || !name || !value) {
        continue;
      }
      if (!categorizedEntries[category]) {
        categorizedEntries[category] = {};
      }
      categorizedEntries[category][name] = { value, timestamp };
      storeDataPoint(category, name, value);
    }
  }, [renderStatistics]);

  const { fps } = useContext(StatisticsContext);
  useEffect(() => {
    const timestamp = Date.now();
    if (!categorizedEntries["FPS"]) {
      categorizedEntries["FPS"] = {};
    }
    categorizedEntries["FPS"]["FPS"] = { value: fps, timestamp };
    storeDataPoint("FPS", "FPS", fps);
  }, [fps]);

  const { isAdmin } = useContext(JobSettingsContext);

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <aside className="render-statistics" style={asideStyle}>
      <div className="resize-section" onMouseDown={handleMouseDown} />
      <h2 className="header">Render statistics</h2>
      <Flex gap="10px">
        <Button
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          <Space>
            <SearchOutlined />
            Analyze data
          </Space>
        </Button>
        <Dropdown
          menu={{
            items: [
              {
                key: "1",
                label: "From 1 minute ago",
                onClick: () =>
                  downloadCSV(getFilteredData(1 * 60000), "stats_1min.csv"),
              },
              {
                key: "2",
                label: "From 5 minutes ago",
                onClick: () =>
                  downloadCSV(getFilteredData(5 * 60000), "stats_5min.csv"),
              },
              {
                key: "3",
                label: "From 10 minutes ago",
                onClick: () =>
                  downloadCSV(getFilteredData(10 * 60000), "stats_10min.csv"),
              },
              {
                key: "4",
                label: "From 15 minutes ago",
                onClick: () =>
                  downloadCSV(getFilteredData(15 * 60000), "stats_15min.csv"),
              },
              {
                key: "5",
                label: "All time",
                onClick: () =>
                  downloadCSV(
                    getFilteredData(Number.MAX_SAFE_INTEGER),
                    "stats_all.csv"
                  ),
              },
            ],
          }}
          trigger={["click"]}
          disabled={!isAdmin}
        >
          <Button>
            <Space>
              <SaveOutlined />
              Save data
              <CaretDownOutlined />
            </Space>
          </Button>
        </Dropdown>
      </Flex>
      <div className="scrollable-content">
        {Object.keys(categorizedEntries).map((category, index) => (
          <Chart
            key={index}
            data={categorizedEntries[category]}
            ylabel={category}
          />
        ))}
        <div className="toggle-button close-button" onClick={toggleAside}>
          <LeftOutlined
            className="close-button-icon"
            style={closeButtonStyle}
          />
        </div>
      </div>
      <ChartAnalysis
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </aside>
  );
}
