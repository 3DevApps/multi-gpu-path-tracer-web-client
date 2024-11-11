import { useEffect, useRef } from "react";
import "./Chart.css";

// @ts-ignore
const autocolors = window["chartjs-plugin-autocolors"];

export default function StaticChartComponent({ data, ylabel }: any) {
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
            type: "linear",
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

  return (
    <div className="chart-wrapper">
      <canvas ref={ref} width="400" height="300"></canvas>
    </div>
  );
}
