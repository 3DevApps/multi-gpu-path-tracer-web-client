import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import config from "../../config/config";
import { useWebSocketConnection } from "../../hooks/useWebSocketConnection";
import { JobSettingsContext } from "../../contexts/JobSettingsContext";
import { PathTracerParamsContext } from "../../contexts/PathTracerParamsContext";
import SettingChangeButton from "./SettingChangeButton";
import ThreadBlockSizeInput from "./ThreadBlockSizeInput";

function NumberInput({
  inputValue,
  setInputValue,
  updateRendererParameter,
  parameterKey,
  disabled = false,
  showSettingChangeButton = true,
}: {
  inputValue: number;
  setInputValue: (value: number) => void;
  updateRendererParameter: (parameterKey: string, value: string) => void;
  parameterKey: string;
  disabled?: boolean;
  showSettingChangeButton?: boolean;
}) {
  const [prevValue, setPrevValue] = useState(inputValue);
  const [value, setValue] = useState(inputValue);

  return (
    <Space.Compact>
      <InputNumber
        className="number-input"
        min={1}
        value={value}
        onChange={(value) => value && setValue(value)}
        disabled={disabled}
      />
      {showSettingChangeButton && (
        <SettingChangeButton
          value={value}
          prevValue={prevValue}
          onClick={() => {
            updateRendererParameter(parameterKey, value.toString());
            setPrevValue(value);
            setInputValue(value);
          }}
          disabled={disabled}
        />
      )}
    </Space.Compact>
  );
}

export default function PathTracerSettings() {
  const { sendMessage } = useWebSocketConnection();
  const { jobId, isAdmin } = useContext(JobSettingsContext);
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
  const filesToUpload = useRef<(string | boolean)[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<
    {
      name: string;
      success: boolean;
    }[]
  >([]);

  const uploadProps: UploadProps = useMemo(
    () => ({
      name: "file",
      action: `${config.HTTP_SERVER_URL}/upload?jobId=${jobId}`,
      multiple: true,
      accept: ".obj,.mtl",
      onChange(info) {
        if (info.file.status === "done") {
          setSceneBeingLoaded(false);
          setUploadedFiles((prev) => [
            ...prev,
            { name: info.file.name, success: true },
          ]);
        } else if (info.file.status === "error") {
          setSceneBeingLoaded(false);
          setUploadedFiles((prev) => [
            ...prev,
            { name: info.file.name, success: false },
          ]);
        }
      },
      beforeUpload: (file, fileList) => {
        filesToUpload.current = fileList.map((file) => file.name);
        setSceneBeingLoaded(true);
        return true;
      },
      showUploadList: false,
    }),
    [jobId, filesToUpload]
  );

  useEffect(() => {
    if (
      uploadedFiles.length !== filesToUpload.current.length ||
      uploadedFiles.length === 0
    ) {
      return;
    }

    if (uploadedFiles.every(({ success }) => success)) {
      message.success(`Files uploaded successfully!`);
      sendMessage(["RENDERER_PARAMETER", "LOAD_UPLOADED_SCENE"]);
    } else {
      message.error(`File upload failed!`);
    }

    setUploadedFiles([]);
  }, [filesToUpload, sendMessage, uploadedFiles]);

  const updateRendererParameter = useCallback(
    (parameterKey: string, value: string) => {
      sendMessage(["RENDERER_PARAMETER", parameterKey, value]);
    },
    [sendMessage]
  );

  const pathTracerParams = useContext(PathTracerParamsContext);

  return (
    <aside className="path-tracer-settings" style={asideStyle}>
      <div className="scrollable-content">
        <Flex align="center" gap="large" vertical>
          <h2>Path tracer settings</h2>
          <Form layout="vertical">
            <Form.Item
              label="Scheduling algorithm"
              tooltip="Algorithm used to schedule the rendering tasks."
            >
              <Select
                placeholder="Select a scheduling algorithm"
                options={config.SCHEDULING_ALGORITHMS}
                defaultValue={config.DEFAULT_SCHEDULING_ALGORITHM}
                onChange={(value) =>
                  updateRendererParameter("SCHEDULING_ALGORITHM", value)
                }
                disabled={!isAdmin}
              />
            </Form.Item>
            <Flex align="space-between" justify="space-between">
              <Form.Item
                label="GPU number"
                tooltip="Number of GPUs used for rendering."
              >
                <NumberInput
                  inputValue={pathTracerParams.gpuNumber}
                  setInputValue={pathTracerParams.setGpuNumber}
                  updateRendererParameter={updateRendererParameter}
                  parameterKey="GPU_NUMBER"
                  disabled={!isAdmin}
                />
              </Form.Item>
              <Form.Item
                label="Streams per GPU"
                tooltip="Streams allow for asynchronous execution of operations on the GPU, enabling overlapping computation and communication to improve performance."
              >
                <NumberInput
                  inputValue={pathTracerParams.streamsPerGpu}
                  setInputValue={pathTracerParams.setStreamsPerGpu}
                  updateRendererParameter={updateRendererParameter}
                  parameterKey="STREAMS_PER_GPU"
                  disabled={!isAdmin}
                />
              </Form.Item>
            </Flex>
            <Flex align="space-between" justify="space-between">
              <Form.Item
                label="Samples per pixel"
                tooltip="The number of light paths or rays traced per pixel during the rendering process."
              >
                <NumberInput
                  inputValue={pathTracerParams.samplesPerPixel}
                  setInputValue={pathTracerParams.setSamplesPerPixel}
                  updateRendererParameter={updateRendererParameter}
                  parameterKey="SAMPLES_PER_PIXEL"
                  disabled={!isAdmin}
                />
              </Form.Item>
              <Form.Item
                label="Recursion depth"
                tooltip="The maximum number of times a ray can bounce or reflect within a scene before the algorithm terminates that path."
              >
                <NumberInput
                  inputValue={pathTracerParams.recursionDepth}
                  setInputValue={pathTracerParams.setRecursionDepth}
                  updateRendererParameter={updateRendererParameter}
                  parameterKey="RECURSION_DEPTH"
                  disabled={!isAdmin}
                />
              </Form.Item>
            </Flex>
            <Form.Item
              label="Thread block size"
              tooltip="The size of single Thread Block in the Grid."
            >
              <ThreadBlockSizeInput
                updateRendererParameter={updateRendererParameter}
                disabled={!isAdmin}
              />
            </Form.Item>
            <Form.Item label="Image resolution (width x height)">
              <ImageResolutionInput
                updateRendererParameter={updateRendererParameter}
                disabled={!isAdmin}
              />
            </Form.Item>
            <Divider />
            <Form.Item>
              <Flex align="center" justify="center">
                <Upload {...uploadProps}>
                  <Button
                    loading={sceneBeingLoaded}
                    icon={<SettingOutlined />}
                    disabled={!isAdmin}
                  >
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
            onClick={() =>
              sendMessage(["RENDERER_PARAMETER", "DOWNLOAD_SCENE_SNAPSHOT"])
            }
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
