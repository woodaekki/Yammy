import { useRef, useEffect, useState } from 'react';
import UsedItemMessageItem from './UsedItemMessageItem';
import '../styles/UsedItemMessageList.css';

/**
 * 중고거래 채팅 메시지 목록
 * - 자동 스크롤
 * - 스크롤 버튼
 */
export default function UsedItemMessageList({ messages, loading, onImageClick }) {
  const messagesEndRef = useRef(null);      // 스크롤 끝 지점 ref
  const containerRef = useRef(null);        // 스크롤 컨테이너 ref
  const [showScrollButton, setShowScrollButton] = useState(false); // 하단 버튼 표시 여부

  // 새 메시지 오면 자동 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // 스크롤 감지 (맨 밑 근처일 때 버튼 숨김)
  const handleScroll = (e) => {
    const el = e.target;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollButton(!nearBottom);
  };

  // 스크롤 최하단 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="message-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">메시지 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="message-list-wrapper">
      <div ref={containerRef} onScroll={handleScroll} className="message-scroll-container">
        {messages.length === 0 ? (
          <div className="message-empty">
            <p>아직 메시지가 없습니다</p>
          </div>
        ) : (
          messages.map((msg) => (
            <UsedItemMessageItem
              key={msg.id}
              message={msg}
              onImageClick={onImageClick}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 스크롤 맨 아래로 버튼 */}
      {showScrollButton && (
        <button onClick={scrollToBottom} className="scroll-bottom-btn" title="맨 아래로">
          ↓
        </button>
      )}
    </div>
  );
}
