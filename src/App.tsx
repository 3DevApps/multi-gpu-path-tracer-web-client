import React from "react";
import "./App.css";
import Header from "./components/Header";
import PathTracerSettings from "./components/PathTracerSettings";
import RenderStream from "./components/RenderStream";
import RenderStatistics from "./components/RenderStatistics";

function App() {
  return (
    <main>
      <Header />
      <div className="main-view-wrapper">
        <PathTracerSettings />
        <RenderStream />
        <RenderStatistics />
      </div>
    </main>
  );
}

export default App;
