import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import "./PathTracerSettings.css";
import {
  Button,
  Divider,
  Flex,
  Form,
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
import ImageResolutionInput from "./ImageResolutionInput";
import config from "../config/config";
import { useWebSocketConnection } from "../hooks/useWebSocketConnection";
import { JobSettingsContext } from "../contexts/JobSettingsContext";

const BUTTON_RED = "#ff0021";

function SettingChangeButton({
  value,
  prevValue,
  onClick,
}: {
  value: any;
  prevValue: any;
  onClick: () => void;
}) {
  const [style, setStyle] = useState<{
    backgroundColor: string | undefined;
  }>({ backgroundColor: undefined });

  useEffect(() => {
    setStyle({
      backgroundColor: value === prevValue ? undefined : BUTTON_RED,
    });
  }, [value, prevValue]);

  return (
    <Button
      className="setting-change-button"
      style={style}
      onClick={onClick}
      type="primary"
    >
      {style.backgroundColor === BUTTON_RED ? "\u276f" : "\u2713"}
    </Button>
  );
}

function NumberInput({
  inputValue,
  setInputValue,
  updateRendererParameter,
  parameterKey,
}: {
  inputValue: number;
  setInputValue: (value: number) => void;
  updateRendererParameter: (parameterKey: string, value: string) => void;
  parameterKey: string;
}) {
  const [prevValue, setPrevValue] = useState(inputValue);

  return (
    <Space.Compact>
      <InputNumber
        className="number-input"
        min={1}
        placeholder="Recursion depth"
        value={inputValue}
        onChange={(value) => value && setInputValue(value)}
      />
      <SettingChangeButton
        value={inputValue}
        prevValue={prevValue}
        onClick={() => {
          updateRendererParameter(parameterKey, inputValue.toString());
          setPrevValue(inputValue);
        }}
      />
    </Space.Compact>
  );
}

export default function PathTracerSettings() {
  const { sendMessage } = useWebSocketConnection();
  const { jobId } = useContext(JobSettingsContext);
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
          sendMessage(["NEW_FILE_UPLOADED"]);
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

  const updateRendererParameter = useCallback(
    (parameterKey: string, value: string) => {
      sendMessage(["RENDERER_PARAMETER", parameterKey, value]);
    },
    [sendMessage]
  );

  // TODO: This could be solved by using a context
  const [gpuNumber, setGpuNumber] = useState(config.DEFAULT_GPU_NUMBER);
  const [streamsPerGpu, setStreamsPerGpu] = useState(
    config.DEFAULT_STREAMS_PER_GPU
  );
  const [samplesPerPixel, setSamplesPerPixel] = useState(
    config.DEFAULT_SAMPLES_PER_PIXEL
  );
  const [recursionDepth, setRecursionDepth] = useState(
    config.DEFAULT_RECURSION_DEPTH
  );

  const [width, setWidth] = useState(config.DEFAULT_IMAGE_RESOLUTION.WIDTH);
  const [prevWidth, setPrevWidth] = useState(
    config.DEFAULT_IMAGE_RESOLUTION.WIDTH
  );
  const [height, setHeight] = useState(config.DEFAULT_IMAGE_RESOLUTION.HEIGHT);
  const [prevHeight, setPrevHeight] = useState(
    config.DEFAULT_IMAGE_RESOLUTION.HEIGHT
  );

  const [threadBlockSizeX, setThreadBlockSizeX] = useState(
    config.DEFAULT_THREAD_BLOCK_SIZE_X
  );
  const [prevThreadBlockSizeX, setPrevThreadBlockSizeX] = useState(
    config.DEFAULT_THREAD_BLOCK_SIZE_X
  );
  const [threadBlockSizeY, setThreadBlockSizeY] = useState(
    config.DEFAULT_THREAD_BLOCK_SIZE_Y
  );
  const [prevThreadBlockSizeY, setPrevThreadBlockSizeY] = useState(
    config.DEFAULT_THREAD_BLOCK_SIZE_Y
  );

  return (
    <aside className="path-tracer-settings" style={asideStyle}>
      <div className="scrollable-content">
        <Flex align="center" gap="large" vertical>
          <h2>Path tracer settings</h2>
          <Form layout="vertical">
            <Form.Item
              label="Scheduling algorithm"
              tooltip="Select a scheduling algorithm"
            >
              <Select
                placeholder="Select a scheduling algorithm"
                options={config.SCHEDULING_ALGORITHMS}
              />
            </Form.Item>
            <Flex align="space-between" justify="space-between">
              <Form.Item label="GPU number" tooltip="Recursion depth">
                <NumberInput
                  inputValue={gpuNumber}
                  setInputValue={setGpuNumber}
                  updateRendererParameter={updateRendererParameter}
                  parameterKey="GPU_NUMBER"
                />
              </Form.Item>
              <Form.Item label="Streams per GPU" tooltip="Recursion depth">
                <NumberInput
                  inputValue={streamsPerGpu}
                  setInputValue={setStreamsPerGpu}
                  updateRendererParameter={updateRendererParameter}
                  parameterKey="STREAMS_PER_GPU"
                />
              </Form.Item>
            </Flex>
            <Flex align="space-between" justify="space-between">
              <Form.Item label="Samples per pixel" tooltip="Recursion depth">
                <NumberInput
                  inputValue={samplesPerPixel}
                  setInputValue={setSamplesPerPixel}
                  updateRendererParameter={updateRendererParameter}
                  parameterKey="SAMPLES_PER_PIXEL"
                />
              </Form.Item>
              <Form.Item label="Recursion depth" tooltip="Recursion depth">
                <NumberInput
                  inputValue={recursionDepth}
                  setInputValue={setRecursionDepth}
                  updateRendererParameter={updateRendererParameter}
                  parameterKey="RECURSION_DEPTH"
                />
              </Form.Item>
            </Flex>
            <Form.Item label="Thread block size" tooltip="hehe">
              <Flex align="space-around" justify="space-around">
                <Flex align="center" gap="5px">
                  <InputNumber
                    min={1}
                    className="thread-block-size-input"
                    onChange={(value) => value && setThreadBlockSizeX(value)}
                    value={threadBlockSizeX}
                  />
                  <b>X</b>
                  <InputNumber
                    min={1}
                    className="thread-block-size-input"
                    onChange={(value) => value && setThreadBlockSizeY(value)}
                    value={threadBlockSizeY}
                  />
                </Flex>
                <SettingChangeButton
                  value={`${threadBlockSizeX}x${threadBlockSizeY}`}
                  prevValue={`${prevThreadBlockSizeX}x${prevThreadBlockSizeY}`}
                  onClick={() => {
                    updateRendererParameter(
                      "THREAD_BLOCK_SIZE",
                      `${threadBlockSizeX}x${threadBlockSizeY}`
                    );
                    setPrevThreadBlockSizeX(threadBlockSizeX);
                    setPrevThreadBlockSizeY(threadBlockSizeY);
                  }}
                />
              </Flex>
            </Form.Item>
            <Form.Item label="Image resolution (width x height)">
              <Flex align="space-around" justify="space-around">
                <ImageResolutionInput
                  width={width}
                  height={height}
                  setWidth={setWidth}
                  setHeight={setHeight}
                />
                <SettingChangeButton
                  value={`${width}x${height}`}
                  prevValue={`${prevWidth}x${prevHeight}`}
                  onClick={() => {
                    updateRendererParameter(
                      "IMAGE_RESOLUTION",
                      `${width}x${height}`
                    );
                    setPrevWidth(width);
                    setPrevHeight(height);
                  }}
                />
              </Flex>
            </Form.Item>
            <Divider />
            <Form.Item>
              <Flex align="center" justify="center">
                <Upload {...uploadProps}>
                  <Button loading={sceneBeingLoaded} icon={<SettingOutlined />}>
                    Load scene
                  </Button>
                </Upload>
              </Flex>
            </Form.Item>
          </Form>
          <Button
            className="download-button"
            type="primary"
            icon={<DownloadOutlined />}
          >
            Download current scene view
          </Button>
        </Flex>
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
