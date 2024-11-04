import React, { useEffect, useRef } from "react";

// Function to generate random colors
function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
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

    const datasets = Object.keys(data).map((key, index) => {
      const color = getRandomColor();
      return {
        label: key,
        cubicInterpolationMode: "monotone",
        backgroundColor: color,
        borderColor: color, // Use the same color for border
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
                    now - data[dataset.label].timestamp < 3000
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
        },
      },
    });
  }, []);

  return (
    <div>
      <canvas ref={ref} width="400" height="300"></canvas>
    </div>
  );
}