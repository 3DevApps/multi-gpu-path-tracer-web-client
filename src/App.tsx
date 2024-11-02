import React from "react";
import "./App.css";
import Header from "./components/Header";
import PathTracerSettings from "./components/PathTracerSettings";
import RenderStream from "./components/RenderStream";
import RenderStatistics from "./components/RenderStatistics";
import { useHandleWebSocketMessages } from "./hooks/useHandleWebSocketMessages";
import { WebsocketContextProvider } from "./contexts/WebsocketContext";
import { JobSettingsContextProvider } from "./contexts/JobSettingsContext";
import { PathTracerParamsContextProvider } from "./contexts/PathTracerParamsContext";

function App() {
  const { renderStatistics } = useHandleWebSocketMessages();

  return (
    <main>
      <Header />
      <div className="main-view-wrapper">
        <PathTracerSettings />
        <RenderStream />
        <RenderStatistics renderStatistics={renderStatistics} />
      </div>
    </main>
  );
}

export default function AppWrapper() {
  return (
    <WebsocketContextProvider>
      <JobSettingsContextProvider>
        <PathTracerParamsContextProvider>
          <App />
        </PathTracerParamsContextProvider>
      </JobSettingsContextProvider>
    </WebsocketContextProvider>
  );
}
