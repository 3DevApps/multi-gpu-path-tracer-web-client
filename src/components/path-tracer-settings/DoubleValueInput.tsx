import { Flex, InputNumber } from "antd";
import React from "react";
import SettingChangeButton from "./SettingChangeButton";

export default function DoubleValueInput({
  firstValue,
  setFirstValue,
  prevFirstValue,
  setPrevFirstValue,
  secondValue,
  setSecondValue,
  prevSecondValue,
  setPrevSecondValue,
  updateRendererParameter,
  disabled,
  separator = "X",
  minValue = 1,
}: {
  firstValue: number;
  setFirstValue: (value: number) => void;
  prevFirstValue?: number;
  setPrevFirstValue?: (value: number) => void;
  secondValue: number;
  setSecondValue: (value: number) => void;
  prevSecondValue?: number;
  setPrevSecondValue?: (value: number) => void;
  updateRendererParameter: (key: string, value: string) => void;
  disabled: boolean;
  separator?: string;
  minValue?: number;
}) {
  const [internalFirstValue, setIntarnalFirstValue] =
    React.useState(firstValue);
  const [internalSecondValue, setInternalSecondValue] =
    React.useState(secondValue);

  return (
    <Flex align="space-around" justify="center" gap="15px">
      <Flex align="center" gap="5px">
        <InputNumber
          min={minValue}
          className="thread-block-size-input"
          onChange={(value) => value && setIntarnalFirstValue(value)}
          value={internalFirstValue}
          disabled={disabled}
        />
        <b>{separator}</b>
        <InputNumber
          min={minValue}
          className="thread-block-size-input"
          onChange={(value) => value && setInternalSecondValue(value)}
          value={internalSecondValue}
          disabled={disabled}
        />
      </Flex>
      <SettingChangeButton
        value={`${internalFirstValue}x${internalSecondValue}`}
        prevValue={
          prevFirstValue &&
          prevSecondValue &&
          `${prevFirstValue}x${prevSecondValue}`
        }
        onClick={() => {
          updateRendererParameter(
            "THREAD_BLOCK_SIZE",
            `${internalFirstValue}#${internalSecondValue}`
          );
          setPrevFirstValue?.(internalFirstValue);
          setPrevSecondValue?.(internalSecondValue);
          setFirstValue(internalFirstValue);
          setSecondValue(internalSecondValue);
        }}
        disabled={disabled}
      />
    </Flex>
  );
}
