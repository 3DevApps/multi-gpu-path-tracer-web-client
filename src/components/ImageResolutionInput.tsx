import React, { useState } from "react";
import { InputNumber, Flex, Space } from "antd";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import "./ImageResolutionInput.css";
import config from "../config/config";

export default function ImageResolutionInput() {
  const [width, setWidth] = useState(config.DEFAULT_IMAGE_RESOLUTION.WIDTH);
  const [height, setHeight] = useState(config.DEFAULT_IMAGE_RESOLUTION.HEIGHT);
  const [aspectRatio, setAspectRatio] = useState(width / height);
  const [shouldMaintainRatio, setShouldMaintainRatio] = useState(true);

  const handleWidthChange = (value: any) => {
    setWidth(value);
    if (shouldMaintainRatio) {
      setHeight(Math.round(value / aspectRatio));
    }
  };

  const handleHeightChange = (value: any) => {
    setHeight(value);
    if (shouldMaintainRatio) {
      setWidth(Math.round(value * aspectRatio));
    }
  };

  const handleMaintainRatio = () => {
    if (shouldMaintainRatio) {
      setShouldMaintainRatio(false);
    } else {
      setShouldMaintainRatio(true);
      setAspectRatio(width / height);
    }
  };

  return (
    <div>
      <Space direction="vertical" align="center">
        <p>Image resolution</p>
        <Flex align="center" gap="5px">
          <InputNumber min={1} value={width} onChange={handleWidthChange} />
          <div className="maintain-ratio-button" onClick={handleMaintainRatio}>
            {shouldMaintainRatio ? <LockOutlined /> : <UnlockOutlined />}
          </div>
          <InputNumber min={1} value={height} onChange={handleHeightChange} />
        </Flex>
      </Space>
    </div>
  );
}
