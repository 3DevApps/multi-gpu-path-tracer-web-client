const wsProtocol = import.meta.env.VITE_DEV_MODE ? "ws" : "wss";
const httpProtocol = import.meta.env.VITE_DEV_MODE ? "http" : "https";

const config = {
  WS_SERVER_URL: "",
  HTTP_SERVER_URL: "",
  DEFAULT_IMAGE_RESOLUTION: {
    WIDTH: 400,
    HEIGHT: 400,
  },
  DEFAULT_GPU_NUMBER: 2,
  DEFAULT_STREAMS_PER_GPU: 5,
  DEFAULT_SAMPLES_PER_PIXEL: 20,
  DEFAULT_RECURSION_DEPTH: 3,
  DEFAULT_THREAD_BLOCK_SIZE_X: 8,
  DEFAULT_THREAD_BLOCK_SIZE_Y: 8,
  LOAD_BALANCING_ALGORITHMS: [
    { value: "FST", label: "Fixed size tasks" },
    { value: "DTFL", label: "Dynamic tasks with fixed layout" },
    { value: "DT", label: "Dynamic layout tasks" },
  ],
  DEFAULT_LOAD_BALANCING_ALGORITHM: "FST",
  SERVER_URL: import.meta.env.VITE_DEV_MODE
    ? "localhost:8080"
    : "pathtracing-relay-server.klatka.it",
};

config.WS_SERVER_URL = `${wsProtocol}://${config.SERVER_URL}`;
config.HTTP_SERVER_URL = `${httpProtocol}://${config.SERVER_URL}`;

export default config;
