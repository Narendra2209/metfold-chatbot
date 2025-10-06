import React, { useState } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'user', text: input }]);

    try {
      const response = await fetch(process.env.REACT_APP_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botText = data.output || 'No response';
      setMessages(prev => [...prev, { sender: 'bot', text: botText }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: '⚠️ Something went wrong.' }]);
    }
    setInput('');
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div>
      {/* Floating Toggle Button */}
      <button 
        className="chat-toggle-btn" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✖' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-wrapper">
          <div className="chat-header">
            <h3>Support Chat</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div className="chat-body">
            {messages.length === 0 ? (
              <div className="chat-placeholder">
                <p>👋 Hi there! Start typing to chat with us.</p>
              </div>
            ) : (
              <div className="chat-messages">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`msg-bubble ${msg.sender}`}>
                    {msg.text}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="chat-input-bar">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="chat-input"
            />
            <button onClick={handleSend} className="chat-send-btn">➤</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
