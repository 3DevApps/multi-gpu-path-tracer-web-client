import { createContext, useMemo } from "react";

type JobSettingsContext = {
  jobId: string | null;
};

export const JobSettingsContext = createContext({} as JobSettingsContext);

export const JobSettingsContextProvider = ({ children }: any) => {
  const jobId = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("jobId");
  }, []);

  return (
    <JobSettingsContext.Provider value={{ jobId }}>
      {children}
    </JobSettingsContext.Provider>
  );
};
