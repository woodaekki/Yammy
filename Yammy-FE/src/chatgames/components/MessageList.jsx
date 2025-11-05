import { useEffect, useRef, useState } from 'react';
import MessageItem from './MessageItem';

/**
 * 메시지 목록 컴포넌트
 * @param {Array} messages - 메시지 배열
 * @param {boolean} loading - 로딩 상태
 * @param {Function} onImageClick - 이미지 클릭 핸들러
 */
export default function MessageList({ messages, loading, onImageClick }) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // 자동 스크롤 (새 메시지 올 때)
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  // 스크롤 위치 감지 (맨 아래로 버튼 표시 여부)
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShowScrollButton(!isNearBottom);
  };

  // 맨 아래로 스크롤 (스무스)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">메시지 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 메시지 목록 */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-[calc(100vh-300px)] overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg"
      >
        {messages.length === 0 ? (
          // 빈 상태
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-400 text-lg mb-2">💬</p>
              <p className="text-gray-500">아직 메시지가 없습니다</p>
              <p className="text-gray-400 text-sm">첫 번째 이미지를 올려보세요!</p>
            </div>
          </div>
        ) : (
          // 메시지 목록
          <>
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onImageClick={onImageClick}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 맨 아래로 버튼 */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          aria-label="맨 아래로"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}
    </div>
  );
}