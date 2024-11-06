import { Flex, InputNumber } from "antd";
import React from "react";
import SettingChangeButton from "./SettingChangeButton";
import "./TripleValueInput.css";

export default function TripleValueInput({
  firstValue,
  setFirstValue,
  prevFirstValue,
  setPrevFirstValue,
  secondValue,
  setSecondValue,
  prevSecondValue,
  setPrevSecondValue,
  thirdValue,
  setThirdValue,
  prevThirdValue,
  setPrevThirdValue,
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
  thirdValue: number;
  setThirdValue: (value: number) => void;
  prevThirdValue?: number;
  setPrevThirdValue?: (value: number) => void;
  updateRendererParameter: (key: string, value: string) => void;
  disabled: boolean;
  separator?: string;
  minValue?: number;
}) {
  const [internalFirstValue, setIntarnalFirstValue] =
    React.useState(firstValue);
  const [internalSecondValue, setInternalSecondValue] =
    React.useState(secondValue);
  const [internalThirdValue, setInternalThirdValue] =
    React.useState(thirdValue);

  return (
    <Flex align="space-around" justify="center" gap="15px">
      <Flex align="center" gap="5px">
        <InputNumber
          min={minValue}
          className="triple-value-input"
          onChange={(value) => value && setIntarnalFirstValue(value)}
          value={internalFirstValue}
          disabled={disabled}
        />
        <b>{separator}</b>
        <InputNumber
          min={minValue}
          className="triple-value-input"
          onChange={(value) => value && setInternalSecondValue(value)}
          value={internalSecondValue}
          disabled={disabled}
        />
        <b>{separator}</b>
        <InputNumber
          min={minValue}
          className="triple-value-input"
          onChange={(value) => value && setInternalThirdValue(value)}
          value={internalThirdValue}
          disabled={disabled}
        />
        <b>&nbsp;</b>
        <SettingChangeButton
          value={`${internalFirstValue}x${internalSecondValue}`}
          prevValue={
            prevFirstValue &&
            prevSecondValue &&
            prevThirdValue &&
            `${prevFirstValue}x${prevSecondValue}x${prevThirdValue}`
          }
          onClick={() => {
            updateRendererParameter(
              "THREAD_BLOCK_SIZE",
              `${internalFirstValue}#${internalSecondValue}#${internalThirdValue}`
            );
            setPrevFirstValue?.(internalFirstValue);
            setPrevSecondValue?.(internalSecondValue);
            setPrevThirdValue?.(internalThirdValue);
            setFirstValue(internalFirstValue);
            setSecondValue(internalSecondValue);
            setThirdValue(internalThirdValue);
          }}
          disabled={disabled}
        />
      </Flex>
    </Flex>
  );
}
