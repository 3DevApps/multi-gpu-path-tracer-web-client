const config = {
  WS_SERVER_URL: "",
  HTTP_SERVER_URL: "",
  DEFAULT_IMAGE_RESOLUTION: {
    WIDTH: 1920,
    HEIGHT: 1080,
  },
  SCHEDULING_ALGORITHMS: [
    { value: "FCFS", label: "First-Come, First-Served" },
    { value: "SJN", label: "Shortest-Job-Next" },
    { value: "PS", label: "Priority Scheduling" },
  ],
  SERVER_URL: "localhost:8080",
};

config.WS_SERVER_URL = `ws://${config.SERVER_URL}`;
config.HTTP_SERVER_URL = `http://${config.SERVER_URL}`;

export default config;
