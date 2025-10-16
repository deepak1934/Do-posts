import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Feedback.css";

const STORAGE_KEY = "app_feedback_messages_v1";

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

const Feedback = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState(loadMessages());
  const scrollRef = useRef(null);

  useEffect(() => {
    saveMessages(messages);
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const msg = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
      author: name.trim() ? name.trim() : "Anonymous",
      text: trimmed,
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    setMessages((p) => [...p, msg]);
    setText("");
    setName("");
  };

  // Go back handler
  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="feedback-page">
      <button
        className="back-button"
        onClick={handleBack}
        title="Go back to home"
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          fontSize: "1.8rem",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "#333",
          fontWeight: "bold",
          zIndex: 1000,
        }}
      >
        &times;
      </button>

      <div className="feedback-container">
        <div className="feedback-left">
          <h2>Send Feedback</h2>
          <p className="muted">No email required — leave feedback anonymously or put your name.</p>

          <form className="feedback-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              placeholder="Write your feedback..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
            />
            <div className="feedback-actions">
              <button className="btn primary" type="submit">Send</button>
              <button
                type="button"
                className="btn alt"
                onClick={() => { setText(""); setName(""); }}
              >
                Clear
              </button>
            </div>
          </form>

          <h3 className="section-title">Recent feedback</h3>
          <div className="messages-list public">
            {messages.length === 0 && <div className="empty">No feedback yet.</div>}
            {messages.map((m) => (
              <div key={m.id} className="message-item">
                <div className="message-meta">
                  <span className="message-author">{m.author}</span>
                  <span className="message-time">{new Date(m.createdAt).toLocaleString()}</span>
                </div>
                <div className="message-text">{m.text}</div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </div>

        {/* Removed feedback-right (moderator panel) completely */}

      </div>
    </div>
  );
};

export default Feedback;
