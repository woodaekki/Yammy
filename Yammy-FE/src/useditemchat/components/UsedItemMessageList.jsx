import { useRef, useEffect, useState } from "react";
import useAuthStore from "../../stores/authStore";
import UsedItemMessageItem from "./UsedItemMessageItem";
import "../styles/UsedItemMessageList.css";

/**
 * 중고거래 채팅 메시지 리스트
 * - 내 메시지: 오른쪽
 * - 상대 메시지: 왼쪽
 * - localStorage 기반으로 로그인 정보 유지
 */
export default function UsedItemMessageList({ messages, loading, onImageClick }) {
  const messagesEndRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Zustand + localStorage 혼합 유저 정보
  const { user, isLoggedIn } = useAuthStore();
  const myId = user?.id || localStorage.getItem("memberId");
  const myNickname = user?.nickname || localStorage.getItem("nickname");

  // 메시지 추가 시 맨 아래로 스크롤
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
            // 내 메시지 판별 (id 또는 닉네임 기준)
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
