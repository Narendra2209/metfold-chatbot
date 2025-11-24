import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import logo from "./logo.svg"; // make sure your logo file is inside src/

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const chatEndRef = useRef(null);

  // ✅ Welcome message
  useEffect(() => {
    setMessages([
      {
        sender: "bot",
        text: "👋 Welcome to Metfold Sheet Metals Chatbot! How can I help you today?",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  }, []);

  // ✅ Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ✅ Format text into points and handle line breaks
  const formatAsPoints = (text) => {
    if (!text) return "";

    // Convert newlines (\n) into HTML <br> tags
    let formatted = text.replace(/\n/g, "<br>");

    // Split by numbering like "1. ", "2. ", etc.
    const points = formatted
      .split(/\d+\.\s+/)
      .filter((p) => p.trim() !== "");

    // If there’s only one point, return it as-is (with line breaks)
    if (points.length === 1) {
      return points[0].trim();
    }

    // If multiple points, number them and keep line breaks
    return points.map((p, i) => `${i + 1}. ${p.trim()}`).join("<br>");
  };

  // ✅ Handle message send
  const handleSend = async () => {
    if (!input.trim()) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const userMessage = { sender: "user", text: input, time };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(process.env.REACT_APP_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: messages,
        }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      // ✅ Format with line breaks and numbering
      const formattedText = data.output
        ? formatAsPoints(data.output)
        : "No response received.";

      const botMessage = {
        sender: "bot",
        text: formattedText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `⚠️ Error: ${err.message}`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload only PDF files!");
      e.target.value = "";
      return;
    }

    setPdfFile(file);
    setShowAuthPopup(true);
  };

  // ✅ Handle Authentication
  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    if (userId !== "metfold" || password !== "metfold@2025") {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "❌ Authentication failed. Please enter valid credentials.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setShowAuthPopup(false);
      setUserId("");
      setPassword("");
      setPdfFile(null);
      return;
    }

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: `📎 Uploaded: ${pdfFile.name}`, time },
    ]);
    setShowAuthPopup(false);
    setUserId("");
    setPassword("");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("filename", pdfFile.name);

    try {
      const uploadUrl =
        process.env.REACT_APP_UPLOAD_WEBHOOK_URL || process.env.REACT_APP_WEBHOOK_URL;
      if (!uploadUrl) {
        throw new Error(
          "Upload webhook URL not configured. Set REACT_APP_UPLOAD_WEBHOOK_URL in your .env"
        );
      }

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok)
        throw new Error(`Upload failed: ${response.statusText}`);

      const result = await response.json();

      const formattedText = result.output
        ? formatAsPoints(result.output)
        : "✅ File uploaded successfully and webhook triggered!";

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: formattedText,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (error) {
      console.error("Upload error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `⚠️ Upload failed: ${error.message}`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
      setPdfFile(null);
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
              <div
                className="msg-text"
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
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

      {/* 🔐 Authentication Popup */}
      {showAuthPopup && (
        <div className="auth-overlay">
          <div className="auth-popup">
            <h3>🔒 Authentication Required</h3>
            <form onSubmit={handleAuthSubmit}>
              <input
                type="text"
                placeholder="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="auth-buttons">
                <button type="submit" className="auth-submit-btn">
                  Submit
                </button>
                <button
                  type="button"
                  className="auth-cancel-btn"
                  onClick={() => {
                    setShowAuthPopup(false);
                    setUserId("");
                    setPassword("");
                    setPdfFile(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
