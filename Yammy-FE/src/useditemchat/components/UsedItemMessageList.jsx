import { useRef, useEffect, useState } from 'react';
import UsedItemMessageItem from './UsedItemMessageItem';

/**
 * 중고거래 채팅 메시지 목록
 * - 자동 스크롤
 * - 스크롤 버튼
 */
export default function UsedItemMessageList({ messages, loading, onImageClick }) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // 새 메시지 올 때 자동 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // 스크롤 감지
  const handleScroll = (e) => {
    const el = e.target;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollButton(!nearBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p className="text-gray-500">메시지 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-[calc(100vh-280px)] overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">아직 메시지가 없습니다</p>
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

      {/* 스크롤 버튼 */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-32 right-8 bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-purple-600 transition-colors"
        >
          ↓
        </button>
      )}
    </div>
  );
}
