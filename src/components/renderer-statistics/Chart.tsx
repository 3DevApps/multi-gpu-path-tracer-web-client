import { RedoOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Dropdown, Tooltip } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import "./Chart.css";
import {
  downloadCSV,
  getFilteredData,
  storeFilteredDataToSessionStorage,
} from "./statisticsDataUtils";
import { getFormattedDateTime } from "../../utils/getFormattedDate";

// @ts-ignore
const autocolors = window["chartjs-plugin-autocolors"];

function RecordCircle({ color }: any) {
  return (
    <div
      style={{
        width: 15,
        height: 15,
        borderRadius: 15,
        backgroundColor: color,
        border: "1.5px solid black",
      }}
    />
  );
}

export default function ChartComponent({ data, ylabel }: any) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    // @ts-ignore
    const ctx = ref.current.getContext("2d");
    if (!ctx) {
      return;
    }

    const datasets = Object.keys(data).map((key) => {
      return {
        label: key,
        cubicInterpolationMode: "monotone",
      };
    });

    // @ts-ignore
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        datasets,
      },
      options: {
        scales: {
          x: {
            // @ts-ignore
            type: "realtime",
            realtime: {
              delay: 2000,
              onRefresh: function (chart: any) {
                const now = Date.now();
                chart.data.datasets.forEach((dataset: any) => {
                  if (!data[dataset.label] || !data[dataset.label].timestamp) {
                    return;
                  }
                  const entry =
                    now - data[dataset.label].timestamp < 40000
                      ? data[dataset.label].value || dataset.data.at(-1)?.y
                      : 0;
                  dataset.data.push({
                    x: now,
                    y: entry,
                  });
                  data[dataset.label] = undefined;
                });
              },
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: ylabel,
            },
          },
        },
        plugins: {
          // @ts-ignore
          streaming: {
            frameRate: 30, // Refresh 30 times per second
          },
          legend: {
            display: true,
            position: "bottom",
          },
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true,
              },
              mode: "x",
            },
          },
        },
      },
      plugins: [autocolors],
    });

    return () => {
      // @ts-ignore
      chartRef.current?.destroy();
    };
  }, []);

  const resetZoom = useCallback(() => {
    if (!chartRef.current) {
      return;
    }
    // @ts-ignore
    chartRef.current.resetZoom();
  }, []);

  const [recordState, setRecordState] = useState(false);
  const [recordStartTimestamp, setRecordStartTimestamp] = useState(0);

  return (
    <div className="chart-wrapper">
      <div className="button-wrapper">
        <Tooltip title="Reset zoom" placement="left">
          <Button size="middle" icon={<RedoOutlined />} onClick={resetZoom} />
        </Tooltip>
        <Tooltip title="Save data" placement="left">
          <Dropdown
            menu={{
              items: [
                {
                  key: "1",
                  label: "From 1 minute ago",
                  onClick: () => {
                    const data = getFilteredData(1 * 60000, ylabel);
                    const name = `${getFormattedDateTime()}-stats-${ylabel}-1min`;
                    downloadCSV(data, `${name}.csv`);
                    storeFilteredDataToSessionStorage(data, name);
                  },
                },
                {
                  key: "2",
                  label: "From 5 minutes ago",
                  onClick: () => {
                    const data = getFilteredData(5 * 60000, ylabel);
                    const name = `${getFormattedDateTime()}-stats-${ylabel}-5min`;
                    downloadCSV(data, `${name}.csv`);
                    storeFilteredDataToSessionStorage(data, name);
                  },
                },
                {
                  key: "3",
                  label: "From 10 minutes ago",
                  onClick: () => {
                    const data = getFilteredData(10 * 60000, ylabel);
                    const name = `${getFormattedDateTime()}-stats-${ylabel}-10min`;
                    downloadCSV(data, `${name}.csv`);
                    storeFilteredDataToSessionStorage(data, name);
                  },
                },
                {
                  key: "4",
                  label: "From 15 minutes ago",
                  onClick: () => {
                    const data = getFilteredData(15 * 60000, ylabel);
                    const name = `${getFormattedDateTime()}-stats-${ylabel}-15min`;
                    downloadCSV(data, `${name}.csv`);
                    storeFilteredDataToSessionStorage(data, name);
                  },
                },
                {
                  key: "5",
                  label: "All time",
                  onClick: () => {
                    const data = getFilteredData(
                      Number.MAX_SAFE_INTEGER,
                      ylabel
                    );
                    const name = `${getFormattedDateTime()}-stats-${ylabel}-all`;
                    downloadCSV(data, `${name}.csv`);
                    storeFilteredDataToSessionStorage(data, name);
                  },
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button
              size="middle"
              style={{
                width: 32,
              }}
            >
              <SaveOutlined />
            </Button>
          </Dropdown>
        </Tooltip>
        <Tooltip title="Record data" placement="left">
          <Button
            size="middle"
            icon={<RecordCircle color={recordState ? "red" : "transparent"} />}
            onClick={() => {
              if (recordState) {
                setRecordState(false);
                downloadCSV(
                  getFilteredData(Date.now() - recordStartTimestamp),
                  "stats_recorded.csv"
                );
              } else {
                setRecordState(true);
                setRecordStartTimestamp(Date.now());
              }
            }}
          />
        </Tooltip>
      </div>
      <div>
        <canvas ref={ref} width="400" height="300"></canvas>
      </div>
    </div>
  );
}
