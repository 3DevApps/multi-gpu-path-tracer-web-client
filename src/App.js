// src/App.js
import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [type, setType] = useState("");
  const [files, setFiles] = useState([]);
  const ws = useRef(null);
  const [id, setId] = useState("");

  useEffect(() => {
    // Connect to WebSocket server
    ws.current = new WebSocket("ws://localhost:8080");

    ws.current.onopen = () => {
      console.log("Connected to server");
      // Send init message - first check if we have id as a query param
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("id");
      if (id) {
        setId(id);
        ws.current.send(
          JSON.stringify({
            type: "INIT_CLIENT",
            id,
          })
        );
      } else {
        ws.current.send(
          JSON.stringify({
            type: "INIT_JOB",
          })
        );
      }
    };

    ws.current.onmessage = (rawMessage) => {
      console.log("Received message", rawMessage.data);
      let message;
      try {
        message = JSON.parse(rawMessage.data);
      } catch (error) {
        console.log("Error parsing JSON data", error);
        return;
      }
      setMessages((prevMessages) => [...prevMessages, JSON.stringify(message)]);

      if (message.type === "INIT_OK") {
        // Redirect to the same page with the id as a query param
        // Check if the query param is already present
        if (window.location.search) {
          return;
        }
        setId(message.id);
        window.location.search = `?id=${message.id}`;
      }
    };

    ws.current.onclose = () => {
      console.log("Disconnected from server");
    };

    // Cleanup on component unmount
    return () => {
      ws.current.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws.current && input.trim()) {
      ws.current.send(
        JSON.stringify({
          type,
          message: input,
          id,
        })
      );
      setInput("");
      setType("");
    }
  };

  const sendFiles = () => {
    if (ws.current && files.length > 0) {
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const arrayBuffer = reader.result;
          ws.current.send(
            JSON.stringify({
              type: "FILE",
              id,
              name: file.name,
              file: Array.from(new Uint8Array(arrayBuffer)),
            })
          );
        };
        reader.readAsArrayBuffer(file);
      });
      setFiles([]);
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  return (
    <div className="App">
      <h1>WebSocket Client</h1>
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
      <input
        type="text"
        value={type}
        onChange={(e) => setType(e.target.value)}
        placeholder="Enter type of the message"
      />
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter message"
      />
      <button onClick={sendMessage}>Send Message</button>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        style={{ display: "block", margin: "20px 0" }}
      />
      <button onClick={sendFiles}>Send Files</button>
    </div>
  );
}

export default App;
