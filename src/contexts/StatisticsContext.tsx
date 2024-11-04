import { createContext, useMemo, useState } from "react";

type StatisticsContextType = {
  fps: number;
  setFps: (fps: number) => void;
};

export const StatisticsContext = createContext({} as StatisticsContextType);

export const StatisticsContextProvider = ({ children }: any) => {
  const [fps, setFps] = useState(0);

  return (
    <StatisticsContext.Provider value={{ fps, setFps }}>
      {children}
    </StatisticsContext.Provider>
  );
};
