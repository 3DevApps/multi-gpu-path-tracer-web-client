const wsProtocol = process.env.REACT_APP_ENVIRONMENT === 'development' ? "ws" : "wss";
const httpProtocol = process.env.REACT_APP_ENVIRONMENT === 'development' ? "http" : "https";

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
  SERVER_URL: process.env.REACT_APP_ENVIRONMENT === 'development' ? "localhost:8080" : "pathtracing-relay-server.klatka.it"
};

config.WS_SERVER_URL = `${wsProtocol}://${config.SERVER_URL}`;
config.HTTP_SERVER_URL = `${httpProtocol}://${config.SERVER_URL}`;

export default config;
