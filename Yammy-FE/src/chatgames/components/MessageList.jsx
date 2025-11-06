import { useRef, useEffect, useState } from "react";
import MessageItem from "./MessageItem";
import "../styles/MessageList.css";

export default function MessageList({ messages, loading, onImageClick }) {
  const messagesEndRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleScroll = (e) => {
    const el = e.target;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollButton(!nearBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="message-loading">
        <div className="spinner"></div>
        <p>불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="message-list" onScroll={handleScroll}>
        {messages.length === 0 ? (
          <div className="message-empty">
            <p>아직 메시지가 없습니다</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              onImageClick={onImageClick}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {showScrollButton && (
        <button className="scroll-btn" onClick={scrollToBottom}>
          ↓
        </button>
      )}
    </div>
  );
}
