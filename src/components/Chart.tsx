import React, { useCallback, useEffect, useRef } from "react";

export default function ChartComponent() {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const getRandomInt = (min: number, max: number) => {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    // @ts-ignore
    const ctx = ref.current.getContext("2d");
    if (!ctx) {
      return;
    }
    // @ts-ignore
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Real-Time Data",
            cubicInterpolationMode: "monotone",
          },
        ],
      },
      options: {
        scales: {
          x: {
            // @ts-ignore
            type: "realtime",
            realtime: {
              delay: 2000,
              onRefresh: function (chart: any) {
                chart.data.datasets.forEach(function (dataset: any) {
                  dataset.data.push({
                    x: Date.now(),
                    y: getRandomInt(0, 100),
                  });
                });
              },
            },
          },
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          // @ts-ignore
          streaming: {
            frameRate: 30, // Refresh 30 times per second
          },
        },
      },
    });
  }, []);

  return (
    <div>
      <canvas ref={ref} id="myChart" width="400" height="400"></canvas>
    </div>
  );
}
