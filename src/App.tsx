import React from "react";
import "./App.css";
import Header from "./components/Header";
import PathTracerSettings from "./components/PathTracerSettings";
import RenderStream from "./components/RenderStream";
import RenderStatistics from "./components/RenderStatistics";
import { useHandleWebSocketMessages } from "./hooks/useHandleWebSocketMessages";

function App() {
  const {renderStatistics} = useHandleWebSocketMessages();

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

export default App;
