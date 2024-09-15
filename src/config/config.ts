const wsProtocol =
  process.env.REACT_APP_ENVIRONMENT === "development" ? "ws" : "wss";
const httpProtocol =
  process.env.REACT_APP_ENVIRONMENT === "development" ? "http" : "https";

const config = {
  WS_SERVER_URL: "",
  HTTP_SERVER_URL: "",
  DEFAULT_IMAGE_RESOLUTION: {
    WIDTH: 800,
    HEIGHT: 800,
  },
  DEFAULT_GPU_NUMBER: 2,
  DEFAULT_STREAMS_PER_GPU: 5,
  DEFAULT_SAMPLES_PER_PIXEL: 20,
  DEFAULT_RECURSION_DEPTH: 3,
  DEFAULT_THREAD_BLOCK_SIZE_X: 8,
  DEFAULT_THREAD_BLOCK_SIZE_Y: 8,
  SCHEDULING_ALGORITHMS: [
    { value: "FCFS", label: "First-Come, First-Served" },
    { value: "SJN", label: "Shortest-Job-Next" },
    { value: "PS", label: "Priority Scheduling" },
  ],
  SERVER_URL:
    process.env.REACT_APP_ENVIRONMENT === "development"
      ? "localhost:8080"
      : "pathtracing-relay-server.klatka.it",
};

config.WS_SERVER_URL = `${wsProtocol}://${config.SERVER_URL}`;
config.HTTP_SERVER_URL = `${httpProtocol}://${config.SERVER_URL}`;

export default config;
