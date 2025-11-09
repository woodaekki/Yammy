import { useRef, useEffect, useState } from "react";
import useAuthStore from "../../stores/authStore";
import UsedItemMessageItem from "./UsedItemMessageItem";
import "../styles/UsedItemMessageList.css";

/**
 * 중고거래 채팅 메시지 리스트
 */
export default function UsedItemMessageList({ messages, loading, onImageClick }) {
  const messagesEndRef = useRef(null);
  const messageListRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const { user } = useAuthStore();
  const myId = user?.memberId || localStorage.getItem("memberId");
  const myNickname = user?.nickname || localStorage.getItem("nickname");

  // messages 배열이 변경될 때마다 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      <div className="message-list" ref={messageListRef} onScroll={handleScroll}>
        {messages.length === 0 ? (
          <div className="message-empty">
            <p>아직 메시지가 없습니다</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine =
              msg.senderId?.toString() === myId?.toString() ||
              msg.memberId?.toString() === myId?.toString() ||
              msg.uid?.toString() === myId?.toString() ||
              msg.nickname === myNickname ||
              msg.senderNickname === myNickname ||
              msg.writerNickname === myNickname;

            return (
              <UsedItemMessageItem
                key={msg.id || `${msg.nickname}-${msg.createdAt}`}
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