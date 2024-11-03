import { useCallback, useContext, useEffect, useState } from "react";
import { RenderStatistics } from "../components/renderer-statistics/RenderStatistics";
import { WebsocketContext } from "../contexts/WebsocketContext";
import { JobSettingsContext } from "../contexts/JobSettingsContext";
import { message as messageApi } from "antd";

export function useHandleWebSocketMessages() {
  const { message, sendMessage } = useContext(WebsocketContext);
  const { setIsAdmin, isDebugJob } = useContext(JobSettingsContext);
  const [renderStatistics, setRenderStatistics] = useState<RenderStatistics>(
    []
  );

  const notifyUser = useCallback(
    (data: any) => (isDebugJob ? console.log(data) : messageApi.open(data)),
    [isDebugJob]
  );

  useEffect(() => {
    if (!message) {
      return;
    }
    const type = message[0];
    switch (type) {
      case "RENDER_STATS":
        setRenderStatistics(message.splice(1));
        break;
      case "JOB_ID":
        const url = new URL(window.location.href);
        url.searchParams.set("jobId", message[1]);
        window.history.pushState(null, "", url.toString());
        break;
      case "IS_ADMIN":
        setIsAdmin(message[1] === "true");
        break;
      case "NOTIFICATION":
        switch (message[1]) {
          case "LOADING":
            notifyUser({
              key: message[2],
              type: "loading",
              content: message[3],
              duration: 0,
            });
            break;
          case "SUCCESS":
            notifyUser({
              key: message[2],
              type: "success",
              content: message[3],
            });
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }, [message, sendMessage, setIsAdmin, notifyUser]);

  return { renderStatistics };
}
