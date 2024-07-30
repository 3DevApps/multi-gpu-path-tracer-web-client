import React, { useCallback, useMemo, useState } from "react";
import "./PathTracerSettings.css";
import {
  Button,
  InputNumber,
  message,
  Select,
  Space,
  Upload,
  UploadProps,
} from "antd";
import {
  DownloadOutlined,
  LeftOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import ImageResolutionSetter from "./ImageResolutionInput";
import config from "../config/config";
import { useWebSocketConnection } from "../hooks/useWebSocketConnection";
import { encodeMessage } from "../utils/webSocketMessageFormat";

export default function PathTracerSettings() {
  const { sendMessage } = useWebSocketConnection();
  const [asideStyle, setAsideStyle] = useState({ left: 0 });
  const closeButtonStyle = useMemo(
    () => ({
      transform: `rotate(${asideStyle.left === 0 ? 0 : 180}deg)`,
      right: asideStyle.left === 0 ? 0 : "-2.5rem",
    }),
    [asideStyle]
  );

  const toggleAside = useCallback(() => {
    setAsideStyle((prev) => ({
      left: prev.left === 0 ? -350 : 0,
    }));
  }, []);

  const [sceneBeingLoaded, setSceneBeingLoaded] = useState(false);

  // TODO: move this to a context
  const jobId = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("jobId");
  }, []);

  const uploadProps: UploadProps = useMemo(
    () => ({
      name: "file",
      action: `${config.HTTP_SERVER_URL}/upload?jobId=${jobId}`,
      multiple: true,
      accept: ".obj,.mtl",
      onChange(info) {
        if (info.file.status === "done") {
          message.success(`${info.file.name} file uploaded successfully!`);
          setSceneBeingLoaded(false);

          // Notify the path tracing job about the new scene
          sendMessage(encodeMessage(["NEW_FILE_UPLOADED"]));
        } else if (info.file.status === "error") {
          message.error(`${info.file.name} file upload failed!`);
          setSceneBeingLoaded(false);
        }
      },
      beforeUpload: () => {
        setSceneBeingLoaded(true);
        return true;
      },
      showUploadList: false,
    }),
    [jobId]
  );

  return (
    <aside className="path-tracer-settings" style={asideStyle}>
      <div className="scrollable-content">
        <Space direction="vertical" size="large" align="center">
          <h2>Path tracer settings</h2>
          <Select
            placeholder="Select a scheduling algorithm"
            options={config.SCHEDULING_ALGORITHMS}
          />
          <Space.Compact>
            <InputNumber
              className="gpu-number-input"
              min="1"
              placeholder="GPU Number"
            />
            <Button type="primary">&gt;</Button>
          </Space.Compact>
          <ImageResolutionSetter />
          <Upload {...uploadProps}>
            <Button loading={sceneBeingLoaded} icon={<SettingOutlined />}>
              Load scene
            </Button>
          </Upload>
        </Space>
        <Button
          className="download-button"
          type="primary"
          icon={<DownloadOutlined />}
        >
          Download current scene view
        </Button>
        <div className="toggle-button close-button" onClick={toggleAside}>
          <LeftOutlined
            className="close-button-icon"
            style={closeButtonStyle}
          />
        </div>
      </div>
    </aside>
  );
}
