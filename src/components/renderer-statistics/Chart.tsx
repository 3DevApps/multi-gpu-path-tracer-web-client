import { RedoOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useCallback, useEffect, useRef } from "react";
import "./Chart.css";

// @ts-ignore
const autocolors = window["chartjs-plugin-autocolors"];

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

  return (
    <div className="chart-wrapper">
      <canvas ref={ref} width="400" height="300"></canvas>
      <div className="button-wrapper">
        <Tooltip title="Reset zoom">
          <Button size="middle" icon={<RedoOutlined />} onClick={resetZoom} />
        </Tooltip>
      </div>
    </div>
  );
}
