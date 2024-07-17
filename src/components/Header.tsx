import React, { useCallback, useState } from "react";
import "./Header.css";
import { GithubOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Modal } from "antd";

export default function Header() {
  const handleGithubClick = useCallback(() => {
    window.open("https://github.com/3DevApps/multi-gpu-path-tracer");
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);
  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  return (
    <div className="header-wrapper">
      <header className="header">Multi-GPU Path Tracer</header>
      <div className="header-buttons-wrapper">
        <QuestionCircleOutlined onClick={openModal} className="header-button" />
        <GithubOutlined onClick={handleGithubClick} className="header-button" />
      </div>
      <Modal
        title="Multi-GPU Path Tracer"
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
      >
        <p>
          Engineering thesis project tackling raytracing in remote multi-gpu
          environment.
        </p>
        <br />
        <p>Authors: Patryk Klatka, Wojciech Łoboda, Bartłomiej Tempka</p>
      </Modal>
    </div>
  );
}
