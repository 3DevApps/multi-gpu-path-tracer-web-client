// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const SERVER_LOCATION = "ws://localhost:22636";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [type, setType] = useState("");
  const [files, setFiles] = useState([]);
  const ws = useRef(null);
  const [id, setId] = useState("");

  useEffect(() => {
    // Connect to WebSocket server
    ws.current = new WebSocket(SERVER_LOCATION);

    ws.current.onopen = () => {
      console.log("Connected to server");
      // Send init message - first check if we have id as a query param
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("id");
      if (id) {
        setId(id);
        ws.current.send("INIT_CLIENT#" + id); 
      } else {
        ws.current.send(
          "INIT_JOB#"
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
        type + "#" + id + "#" + input
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
            "FILE#" + id + "#" + file.name + "#" + Array.from(new Uint8Array(arrayBuffer))
          );
        };
        reader.readAsArrayBuffer(file);
      });
      setFiles([]);
      // Clear the input
      const fileInput = document.querySelector("input[type='file']");
      fileInput.value = "";
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const draw = (data) => {
      const text = data;
      // Parse PPM file from text variable
      const lines = text.split("\n");
      const width = parseInt(lines[1].split(" ")[0]);
      const height = parseInt(lines[1].split(" ")[1]);

      // set canvas size
      const canvas = document.getElementById("canvas");
      // canvas.width = width;
      // canvas.height = height;
      const ctx = canvas.getContext("2d");
      const imageData = ctx.createImageData(width, height);

      for (let i = 3; i < lines.length; i++) {
        const r = parseInt(lines[i].split(" ")[0]);
        const g = parseInt(lines[i].split(" ")[1]);
        const b = parseInt(lines[i].split(" ")[2]);

        const index = (i - 3) * 4;
        imageData.data[index] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = 255;

        if ((i - 3) % width === 0) {
          ctx.putImageData(imageData, 0, 0);
        }
      }
    };

  return (
    <div className="App">
      <h1>WebSocket Client</h1>
      <canvas id="canvas" style={{
        border: "1px solid black",
        width: 800,
      }}></canvas>
      <div style={{
        position: "fixed",
        bottom: 20,
        width: "100%",
        left: "50%",
        transform: "translateX(-50%)",
      }}>
      <input
        type="text"
        value={type}
        onChange={(e) => setType(e.target.value)}
        placeholder="Type of the message"
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
        style={{ display: "block", margin: "auto", marginTop: 20 }}
      />
      <button onClick={sendFiles}>Send Files</button>
      <button onClick={() => {
        ws.current.send(
          "DISPATCH_JOB#" + id
        );
      }}>Start job</button>
      <button onClick={() => {
        ws.current.send(
          "KILL_JOB#" + id
        );
      }}>Kill job</button>
    </div>
    </div>
  );
}

export default App;
