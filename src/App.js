import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import logo from "./logo.png"; // make sure your logo is in src/

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // ✅ Add welcome message when component loads
  useEffect(() => {
    setMessages([
      {
        sender: "bot",
        text: "👋 Welcome to Metfold Sheet Metals Chatbot! How can I help you today?",
      },
    ]);
  }, []);

  // ✅ Auto scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
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
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `⚠️ Error: ${err.message}` },
      ]);
    } finally {
      setIsLoading(false);
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

      {/* Body */}
      <main className="chat-body">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`msg-bubble ${msg.sender}`}>
              {msg.text}
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

      {/* Input */}
      <footer className="chat-input-bar">
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
