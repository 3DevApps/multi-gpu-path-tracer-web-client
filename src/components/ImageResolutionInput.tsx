import React, { useState } from "react";
import { InputNumber, Flex, Space, Button } from "antd";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import "./ImageResolutionInput.css";

export default function ImageResolutionInput({
  width,
  height,
  setWidth,
  setHeight,
}: {
  width: number;
  height: number;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
}) {
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
    <Space direction="vertical" align="center">
      <Flex align="center" gap="5px">
        <InputNumber min={1} value={width} onChange={handleWidthChange} />
        <div className="maintain-ratio-button" onClick={handleMaintainRatio}>
          {shouldMaintainRatio ? <LockOutlined /> : <UnlockOutlined />}
        </div>
        <InputNumber min={1} value={height} onChange={handleHeightChange} />
      </Flex>
    </Space>
  );
}
