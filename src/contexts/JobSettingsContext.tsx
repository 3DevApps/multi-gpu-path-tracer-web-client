import { createContext, useMemo, useState } from "react";

type JobSettingsContext = {
  jobId: string | null;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
};

export const JobSettingsContext = createContext({} as JobSettingsContext);

export const JobSettingsContextProvider = ({ children }: any) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const jobId = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("jobId");
  }, []);

  return (
    <JobSettingsContext.Provider value={{ jobId, isAdmin, setIsAdmin }}>
      {children}
    </JobSettingsContext.Provider>
  );
};
