import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import logo from "./logo.png"; // make sure your logo file is inside src/

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // ✅ Add welcome message
  useEffect(() => {
    setMessages([
      {
        sender: "bot",
        text: "👋 Welcome to Metfold Sheet Metals Chatbot! How can I help you today?",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, []);

  // ✅ Auto-scroll when new messages appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ✅ Handle message send
  const handleSend = async () => {
    if (!input.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMessage = { sender: "user", text: input, time };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(process.env.REACT_APP_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      const botMessage = {
        sender: "bot",
        text: data.output || "No response received.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `⚠️ Error: ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle file upload (PDF → webhook)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please upload only PDF files!");
      return;
    }

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: `📎 Uploaded: ${file.name}`, time },
    ]);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", file.name);

    try {
      const response = await fetch(
        "https://rtaisrini.app.n8n.cloud/webhook/aa8cd6d6-431f-4821-b7c7-3b2cda24cb82",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "✅ File uploaded successfully and webhook triggered!",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (error) {
      console.error("Upload error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `⚠️ Upload failed: ${error.message}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
      e.target.value = ""; // reset input
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="chat-wrapper">
      {/* Header */}
      <header className="chat-header">
        <img src={logo} alt="logo" className="chat-logo" />
      </header>

      {/* Chat Body */}
      <main className="chat-body">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`msg-bubble ${msg.sender}`}>
              <div className="msg-text">{msg.text}</div>
              <div className="msg-time">{msg.time}</div>
            </div>
          ))}

          {isLoading && (
            <div className="msg-bubble bot typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="chat-input-bar">
        <label htmlFor="file-upload" className="file-upload-label" title="Upload PDF">
          📎
        </label>
        <input
          id="file-upload"
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          className="chat-file-input"
        />

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="chat-input"
        />

        <button onClick={handleSend} className="chat-send-btn">
          ➤
        </button>
      </footer>
    </div>
  );
}

export default App;
