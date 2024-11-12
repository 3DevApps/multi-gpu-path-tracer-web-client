import {
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
  Checkbox,
  Divider,
  Dropdown,
  Flex,
  Form,
  InputNumber,
  message,
  Select,
  Space,
  Tooltip,
} from "antd";
import {
  CaretDownOutlined,
  DownloadOutlined,
  ExportOutlined,
  ImportOutlined,
  LeftOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import ImageResolutionInput from "./ImageResolutionInput";
import config from "../../config/config";
import { useWebSocketConnection } from "../../hooks/useWebSocketConnection";
import { JobSettingsContext } from "../../contexts/JobSettingsContext";
import { PathTracerParamsContext } from "../../contexts/PathTracerParamsContext";
import SettingChangeButton from "./SettingChangeButton";
import DoubleValueInput from "./DoubleValueInput";
import TripleValueInput from "./TripleValueInput";

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

  useEffect(() => {
    setValue(inputValue);
  }, [inputValue]);

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
  const pathTracerParams = useContext(PathTracerParamsContext);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();

    // Append all files to same FormData
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch(
        `${config.HTTP_SERVER_URL}/upload?jobId=${jobId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        message.error("Upload failed - server error");
        return;
      }

      message.success("Upload successful!");
      sendMessage(["RENDERER_PARAMETER", "LOAD_UPLOADED_SCENE"]);
    } catch (error) {
      message.error("Upload failed - network error");
      console.error(
        "Failed files:",
        Array.from(files).map((file) => ({
          name: file.name,
          success: false,
        }))
      );
    } finally {
      setIsUploading(false);
      event.target.value = ""; // Reset input
    }
  };

  const updateRendererParameter = useCallback(
    (parameterKey: string, value: string) => {
      // TODO: improve this
      if (parameterKey === "PITCH_YAW" || parameterKey === "SCENE_POSITION") {
        sendMessage(["CAMERA_EVENT", parameterKey, value]);
        return;
      }
      sendMessage(["RENDERER_PARAMETER", parameterKey, value]);
    },
    [sendMessage]
  );

  const setLoadBalancingAlgorithm = useCallback(
    (value: string) => {
      updateRendererParameter("LOAD_BALANCING_ALGORITHM", value);
      pathTracerParams.setLoadBalancingAlgorithm(value);
    },
    [updateRendererParameter, pathTracerParams]
  );

  const setShowTaskGrid = useCallback(() => {
    const showTaskGrid = !pathTracerParams.showTaskGrid;
    pathTracerParams.setShowTaskGrid(showTaskGrid);
    updateRendererParameter(
      "SHOW_TASK_GRID",
      showTaskGrid.toString()
    );
  }, [updateRendererParameter, pathTracerParams]);

  const loadSettingsFromJSON = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const content = await file.text();
      try {
        pathTracerParams.importStateFromJSON(content);
      } catch (err) {
        console.error("Failed to parse settings file:", err);
      }
    };

    input.click();
  }, [pathTracerParams]);

  const saveSettingsToJSON = useCallback(() => {
    const json = pathTracerParams.exportStateToJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "settings.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [pathTracerParams]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = (e: React.MouseEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  return (
    <aside className="path-tracer-settings" style={asideStyle}>
      <div className="scrollable-content">
        <Flex align="center" gap="large" vertical>
          <h2>Path tracer settings</h2>
          <Form layout="vertical">
            <Form.Item
              label="Load balancing algorithm"
              tooltip="Algorithm used to schedule the rendering tasks."
            >
              <Select
                placeholder="Select a load balancing algorithm"
                options={config.LOAD_BALANCING_ALGORITHMS}
                defaultValue={config.DEFAULT_LOAD_BALANCING_ALGORITHM}
                onChange={setLoadBalancingAlgorithm}
                value={pathTracerParams.loadBalancingAlgorithm}
                disabled={!isAdmin}
              />
            </Form.Item>
            {/* <Form.Item
              label="Task size"
              tooltip="The size of the task in load balancing algorithm"
            >
              <DoubleValueInput
                keyName="LOAD_BALANCING_TASK_SIZE"
                firstValue={pathTracerParams.loadBalancingTaskSizeX}
                prevFirstValue={pathTracerParams.prevLoadBalancingTaskSizeX}
                setFirstValue={pathTracerParams.setLoadBalancingTaskSizeX}
                setPrevFirstValue={
                  pathTracerParams.setPrevLoadBalancingTaskSizeX
                }
                secondValue={pathTracerParams.loadBalancingTaskSizeY}
                setSecondValue={pathTracerParams.setLoadBalancingTaskSizeY}
                prevSecondValue={pathTracerParams.prevLoadBalancingTaskSizeY}
                setPrevSecondValue={
                  pathTracerParams.setPrevLoadBalancingTaskSizeY
                }
                updateRendererParameter={updateRendererParameter}
                disabled={!isAdmin}
              />
            </Form.Item> */}
            <Form.Item>
              <Checkbox
                onChange={setShowTaskGrid}
                checked={pathTracerParams.showTaskGrid}
                disabled={!isAdmin}
              >
                Show task grid
              </Checkbox>
              <Tooltip title="Show the grid of tasks in the scene">
                <QuestionCircleOutlined style={{ color: "#858585" }} />
              </Tooltip>
            </Form.Item>
            <Divider />
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
              <DoubleValueInput
                keyName="THREAD_BLOCK_SIZE"
                firstValue={pathTracerParams.threadBlockSizeX}
                prevFirstValue={pathTracerParams.prevThreadBlockSizeX}
                setFirstValue={pathTracerParams.setThreadBlockSizeX}
                setPrevFirstValue={pathTracerParams.setPrevThreadBlockSizeX}
                secondValue={pathTracerParams.threadBlockSizeY}
                setSecondValue={pathTracerParams.setThreadBlockSizeY}
                prevSecondValue={pathTracerParams.prevThreadBlockSizeY}
                setPrevSecondValue={pathTracerParams.setPrevThreadBlockSizeY}
                updateRendererParameter={updateRendererParameter}
                disabled={!isAdmin}
              />
            </Form.Item>
            <Divider />
            <Form.Item label="Image resolution (width x height)">
              <ImageResolutionInput
                updateRendererParameter={updateRendererParameter}
                disabled={!isAdmin}
              />
            </Form.Item>
            <Form.Item label="Camera position (x, y, z)">
              <TripleValueInput
                keyName="SCENE_POSITION"
                firstValue={pathTracerParams.scenePositionX}
                setFirstValue={pathTracerParams.setScenePositionX}
                secondValue={pathTracerParams.scenePositionY}
                setSecondValue={pathTracerParams.setScenePositionY}
                thirdValue={pathTracerParams.scenePositionZ}
                setThirdValue={pathTracerParams.setScenePositionZ}
                updateRendererParameter={updateRendererParameter}
                disabled={!isAdmin}
                separator=","
                minValue={null}
              />
            </Form.Item>
            <Form.Item label="Pitch and yaw (pitch, yaw)">
              <DoubleValueInput
                keyName="PITCH_YAW"
                firstValue={pathTracerParams.pitch}
                setFirstValue={pathTracerParams.setPitch}
                secondValue={pathTracerParams.yaw}
                setSecondValue={pathTracerParams.setYaw}
                updateRendererParameter={updateRendererParameter}
                disabled={!isAdmin}
                separator=","
                minValue={null}
              />
            </Form.Item>
            <Form.Item>
              <Flex align="center" justify="center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <Button
                  onClick={triggerFileInput}
                  loading={isUploading}
                  icon={<SettingOutlined />}
                  disabled={!isAdmin}
                >
                  Load scene
                </Button>
              </Flex>
            </Form.Item>
            <Divider />
            <Form.Item>
              <Flex align="center" justify="center" gap="20px">
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "1",
                        icon: <ImportOutlined />,
                        label: "Load .json settings",
                        onClick: loadSettingsFromJSON,
                      },
                      {
                        key: "2",
                        label: "Save settings to .json",
                        icon: <ExportOutlined />,
                        onClick: saveSettingsToJSON,
                      },
                    ],
                  }}
                  trigger={["click"]}
                  disabled={!isAdmin}
                >
                  <Button className="primary-button">
                    <Space>
                      <UploadOutlined />
                      Import / Export settings
                      <CaretDownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </Flex>
            </Form.Item>
            <Flex align="center" justify="center" gap="20px">
              <Form.Item>
                <Button
                  className="primary-button"
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() =>
                    sendMessage([
                      "RENDERER_PARAMETER",
                      "DOWNLOAD_SCENE_SNAPSHOT",
                    ])
                  }
                  disabled={!isAdmin}
                >
                  Download current view
                </Button>
              </Form.Item>
            </Flex>
          </Form>
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
