import { Flex, InputNumber } from "antd";
import React, { useContext } from "react";
import SettingChangeButton from "./SettingChangeButton";
import { PathTracerParamsContext } from "../contexts/PathTracerParamsContext";

export default function ThreadBlockSizeInput({
  updateRendererParameter,
  disabled,
}: {
  updateRendererParameter: (key: string, value: string) => void;
  disabled: boolean;
}) {
  const pathTracerParams = useContext(PathTracerParamsContext);
  const [internalThreadBlockSizeX, setInternalThreadBlockSizeX] =
    React.useState(pathTracerParams.threadBlockSizeX);
  const [internalThreadBlockSizeY, setInternalThreadBlockSizeY] =
    React.useState(pathTracerParams.threadBlockSizeY);

  return (
    <Flex align="space-around" justify="space-around">
      <Flex align="center" gap="5px">
        <InputNumber
          min={1}
          className="thread-block-size-input"
          onChange={(value) => value && setInternalThreadBlockSizeX(value)}
          value={internalThreadBlockSizeX}
          disabled={disabled}
        />
        <b>X</b>
        <InputNumber
          min={1}
          className="thread-block-size-input"
          onChange={(value) => value && setInternalThreadBlockSizeY(value)}
          value={internalThreadBlockSizeY}
          disabled={disabled}
        />
      </Flex>
      <SettingChangeButton
        value={`${internalThreadBlockSizeX}x${internalThreadBlockSizeY}`}
        prevValue={`${pathTracerParams.prevThreadBlockSizeX}x${pathTracerParams.prevThreadBlockSizeY}`}
        onClick={() => {
          updateRendererParameter(
            "THREAD_BLOCK_SIZE",
            `${internalThreadBlockSizeX}#${internalThreadBlockSizeY}`
          );
          pathTracerParams.setPrevThreadBlockSizeX(internalThreadBlockSizeX);
          pathTracerParams.setPrevThreadBlockSizeY(internalThreadBlockSizeY);
          pathTracerParams.setThreadBlockSizeX(internalThreadBlockSizeX);
          pathTracerParams.setThreadBlockSizeY(internalThreadBlockSizeY);
        }}
        disabled={disabled}
      />
    </Flex>
  );
}
