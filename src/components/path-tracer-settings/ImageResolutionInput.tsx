import { useContext, useState } from "react";
import { InputNumber, Flex, Space } from "antd";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import "./ImageResolutionInput.css";
import SettingChangeButton from "./SettingChangeButton";
import { PathTracerParamsContext } from "../../contexts/PathTracerParamsContext";

export default function ImageResolutionInput({
  updateRendererParameter,
  disabled,
}: {
  updateRendererParameter: (key: string, value: string) => void;
  disabled?: boolean;
}) {
  const pathTracerParams = useContext(PathTracerParamsContext);
  const [aspectRatio, setAspectRatio] = useState(
    pathTracerParams.width / pathTracerParams.height
  );
  const [shouldMaintainRatio, setShouldMaintainRatio] = useState(true);
  const [internalWidth, setInternalWidth] = useState(pathTracerParams.width);
  const [internalHeight, setInternalHeight] = useState(pathTracerParams.height);

  const handleWidthChange = (value: any) => {
    setInternalWidth(value);
    if (shouldMaintainRatio) {
      setInternalHeight(Math.round(value / aspectRatio));
    }
  };

  const handleHeightChange = (value: any) => {
    setInternalHeight(value);
    if (shouldMaintainRatio) {
      setInternalWidth(Math.round(value * aspectRatio));
    }
  };

  const handleMaintainRatio = () => {
    if (shouldMaintainRatio) {
      setShouldMaintainRatio(false);
    } else {
      setShouldMaintainRatio(true);
      setAspectRatio(internalWidth / internalHeight);
    }
  };

  return (
    <Flex align="space-around" justify="space-around">
      <Space direction="vertical" align="center">
        <Flex align="center" gap="5px">
          <InputNumber
            min={1}
            value={internalWidth}
            onChange={handleWidthChange}
            disabled={disabled}
          />
          <div className="maintain-ratio-button" onClick={handleMaintainRatio}>
            {shouldMaintainRatio ? <LockOutlined /> : <UnlockOutlined />}
          </div>
          <InputNumber
            min={1}
            value={internalHeight}
            onChange={handleHeightChange}
            disabled={disabled}
          />
        </Flex>
      </Space>
      <SettingChangeButton
        value={`${internalWidth}x${internalHeight}`}
        prevValue={`${pathTracerParams.prevWidth}x${pathTracerParams.prevHeight}`}
        onClick={() => {
          updateRendererParameter(
            "IMAGE_RESOLUTION",
            `${internalWidth}#${internalHeight}`
          );
          pathTracerParams.setPrevWidth(internalWidth);
          pathTracerParams.setPrevHeight(internalHeight);
          pathTracerParams.setWidth(internalWidth);
          pathTracerParams.setHeight(internalHeight);
        }}
        disabled={disabled}
      />
    </Flex>
  );
}
