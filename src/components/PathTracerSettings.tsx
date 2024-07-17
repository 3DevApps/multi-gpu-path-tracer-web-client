import React, { useCallback, useMemo, useState } from "react";
import "./PathTracerSettings.css";
import {
  Button,
  Flex,
  InputNumber,
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

const props: UploadProps = {
  name: "file",
  action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
  multiple: true,
  accept: ".obj,.mtl",
  headers: {
    authorization: "authorization-text",
  },
  onChange(info) {
    if (info.file.status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === "done") {
      // message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      // message.error(`${info.file.name} file upload failed.`);
    }
  },
};

export default function PathTracerSettings() {
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
          <Upload {...props}>
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
