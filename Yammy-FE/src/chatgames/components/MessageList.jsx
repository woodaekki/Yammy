import { useRef, useEffect, useState } from "react";
import useAuthStore from "../../stores/authStore";
import MessageItem from "./MessageItem";
import "../styles/MessageList.css";

export default function MessageList({ messages, loading, onImageClick }) {
  const messagesEndRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // 현재 로그인한 유저 정보
  const { user, isLoggedIn } = useAuthStore();
  const myId = user?.id || localStorage.getItem("memberId");
  const myNickname = user?.nickname || localStorage.getItem("nickname");

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
          messages.map((msg) => {
            // 내 메시지 판별 로직 (id 또는 닉네임 일치)
            const isMine =
              (msg.senderId?.toString() === myId?.toString() ||
                msg.memberId?.toString() === myId?.toString() ||
                msg.nickname === myNickname ||
                msg.senderNickname === myNickname ||
                msg.writerNickname === myNickname) &&
              isLoggedIn;

            return (
              <MessageItem
                key={msg.id}
                message={msg}
                onImageClick={onImageClick}
                isMine={isMine}
              />
            );
          })
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
