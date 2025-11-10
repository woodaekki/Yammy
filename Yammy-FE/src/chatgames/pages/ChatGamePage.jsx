import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useChatMessages } from '../hooks/useChatMessages';
import GameHeader from '../components/GameHeader';
import MessageItem from '../components/MessageItem';
import ImageUpload from '../components/ImageUpload';
import useAuthStore from '../../stores/authStore';
import "../styles/ImageUpload.css";
import "../styles/ChatGamePage.css";

/**
 * 채팅 게임 메인 페이지 (헤더/업로드 고정)
 */
export default function ChatGamePage() {
  const { roomKey } = useParams();
  const [room, setRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const { messages, loading: loadingMessages, error } = useChatMessages(roomKey);
  
  const { user, isLoggedIn } = useAuthStore();
  const myId = user?.id || localStorage.getItem("memberId");
  const myNickname = user?.nickname || localStorage.getItem("nickname");

  useEffect(() => {
    if (!roomKey) return;

    setTimeout(() => {
      setRoom({
        roomKey: roomKey,
        name: "채팅 게임",
        homeTeam: "KIA",
        awayTeam: "LG",
        doubleHeader: false,
        startAt: new Date().toISOString(),
        status: "ACTIVE"
      });
      setLoadingRoom(false);
    }, 500);
  }, [roomKey]);

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

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleUploadSuccess = (result) => {
    console.log('업로드 성공:', result);
  };

  const handleUploadError = (error) => {
    console.error('업로드 실패:', error);
    alert('이미지 업로드 실패: ' + error.message);
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error-box">
          <h2>채팅방 오류</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            새로고침
          </button>
        </div>
      </div>
    );
  }

  if (!roomKey) {
    return (
      <div className="error-container">
        <div className="error-box">
          <h2>채팅방을 찾을 수 없습니다</h2>
          <p>올바른 채팅방 링크로 접속해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page-container">
      {/* 고정된 헤더 */}
      <div className="chat-header-fixed">
        <GameHeader room={loadingRoom ? null : room} />
      </div>

      {/* 스크롤 가능한 메시지 영역 */}
      <div 
        className="chat-messages-container"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {loadingMessages ? (
          <div className="message-loading">
            <div className="spinner"></div>
            <p>불러오는 중...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="message-empty">
            <p>아직 메시지가 없습니다</p>
          </div>
        ) : (
          <div className="messages-wrapper">
            {messages.map((msg) => {
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
                  onImageClick={handleImageClick}
                  isMine={isMine}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 스크롤 버튼 */}
      {showScrollButton && (
        <button className="scroll-btn" onClick={scrollToBottom}>
          ↓
        </button>
      )}

      {/* 고정된 이미지 업로드 바 */}
      <div className="chat-upload-fixed">
        <ImageUpload
          roomKey={roomKey}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      </div>

      {/* 이미지 확대 모달 */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={closeModal}>
          <div className="image-modal-content">
            <button onClick={closeModal} className="image-modal-close">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage}
              alt="확대 보기"
              className="image-modal-img"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}