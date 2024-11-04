import { createContext, useState } from "react";
import config from "../config/config";

type PathTracerParamsContextType = {
  gpuNumber: number;
  setGpuNumber: (gpuNumber: number) => void;
  streamsPerGpu: number;
  setStreamsPerGpu: (streamsPerGpu: number) => void;
  samplesPerPixel: number;
  setSamplesPerPixel: (samplesPerPixel: number) => void;
  recursionDepth: number;
  setRecursionDepth: (recursionDepth: number) => void;
  width: number;
  setWidth: (width: number) => void;
  prevWidth: number;
  setPrevWidth: (prevWidth: number) => void;
  height: number;
  setHeight: (height: number) => void;
  prevHeight: number;
  setPrevHeight: (prevHeight: number) => void;
  threadBlockSizeX: number;
  setThreadBlockSizeX: (threadBlockSizeX: number) => void;
  prevThreadBlockSizeX: number;
  setPrevThreadBlockSizeX: (prevThreadBlockSizeX: number) => void;
  threadBlockSizeY: number;
  setThreadBlockSizeY: (threadBlockSizeY: number) => void;
  prevThreadBlockSizeY: number;
  setPrevThreadBlockSizeY: (prevThreadBlockSizeY: number) => void;
};

export const PathTracerParamsContext = createContext(
  {} as PathTracerParamsContextType
);

export const PathTracerParamsContextProvider = ({ children }: any) => {
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
    <PathTracerParamsContext.Provider
      value={{
        gpuNumber,
        setGpuNumber,
        streamsPerGpu,
        setStreamsPerGpu,
        samplesPerPixel,
        setSamplesPerPixel,
        recursionDepth,
        setRecursionDepth,
        width,
        setWidth,
        prevWidth,
        setPrevWidth,
        height,
        setHeight,
        prevHeight,
        setPrevHeight,
        threadBlockSizeX,
        setThreadBlockSizeX,
        prevThreadBlockSizeX,
        setPrevThreadBlockSizeX,
        threadBlockSizeY,
        setThreadBlockSizeY,
        prevThreadBlockSizeY,
        setPrevThreadBlockSizeY,
      }}
    >
      {children}
    </PathTracerParamsContext.Provider>
  );
};
