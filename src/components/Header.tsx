import React, { useCallback } from "react";
import "./Header.css";
import { GithubOutlined, QuestionCircleOutlined } from "@ant-design/icons";

export default function Header() {
  const handleGithubClick = useCallback(() => {
    window.open("https://github.com/3DevApps/multi-gpu-path-tracer");
  }, []);

  return (
    <div className="header-wrapper">
      <header className="header">Multi-GPU Path Tracer</header>
      <div className="header-buttons-wrapper">
        <QuestionCircleOutlined className="header-button" />
        <GithubOutlined onClick={handleGithubClick} className="header-button" />
      </div>
    </div>
  );
}
