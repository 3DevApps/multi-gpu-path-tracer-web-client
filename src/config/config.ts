export default {
  DEFAULT_IMAGE_RESOLUTION: {
    WIDTH: 1920,
    HEIGHT: 1080,
  },
  SCHEDULING_ALGORITHMS: [
    { value: "FCFS", label: "First-Come, First-Served" },
    { value: "SJN", label: "Shortest-Job-Next" },
    { value: "PS", label: "Priority Scheduling" },
  ],
  WS_SERVER_URL: "ws://localhost:8080",
};
