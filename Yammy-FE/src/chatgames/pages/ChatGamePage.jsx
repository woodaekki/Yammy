import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useChatMessages } from '../hooks/useChatMessages';
import { chatRoomApi } from '../api/chatApi';
import GameHeader from '../components/GameHeader';
import MessageItem from '../components/MessageItem';
import ImageUpload from '../components/ImageUpload';
import NavigationBarBottom from '../../shared/components/NavigationBarBottom';
import useAuthStore from '../../stores/authStore';
import "../styles/ImageUpload.css";
import "../styles/ChatGamePage.css";

/**
 * 채팅 게임 메인 페이지 (헤더/업로드 고정)
 */
export default function ChatGamePage() {
  const { roomKey } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [roomLoadError, setRoomLoadError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const { messages, loading: loadingMessages, error } = useChatMessages(roomKey);
  
  const { user, isLoggedIn } = useAuthStore();
  const myId = user?.id || localStorage.getItem("memberId");
  const myNickname = user?.nickname || localStorage.getItem("nickname");

  // 이미지 확대 시 body 스크롤 잠금
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [selectedImage]);

  useEffect(() => {
    if (!roomKey) return;

    chatRoomApi.getRoomByKey(roomKey)
      .then(roomData => {
        setRoom(roomData);
        setLoadingRoom(false);
      })
      .catch(error => {
        console.error('[ChatGamePage] 채팅방 정보 로드 실패:', {
          roomKey,
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        setRoomLoadError("채팅방을 찾을 수 없습니다.");
        setLoadingRoom(false);
      });
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
    console.log('[ChatGamePage] 이미지 업로드 성공:', {
      roomKey,
      messageId: result?.messageId,
      imageUrl: result?.imageUrl
    });
  };

  const handleUploadError = (error) => {
    console.error('[ChatGamePage] 이미지 업로드 실패:', {
      roomKey,
      error: error.message,
      status: error.response?.status
    });
    alert('이미지 업로드 실패: ' + error.message);
  };

  if (error || roomLoadError) {
    return (
      <div className="error-container">
        <div className="error-box">
          <h2>채팅방 오류</h2>
          <p>{error || roomLoadError}</p>
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
      {/* 고정된 헤더 (Portal로 document.body에 렌더링) */}
      {createPortal(
        <div className="chat-header-fixed">
          <GameHeader room={loadingRoom ? null : room} navigate={navigate} />
        </div>,
        document.body
      )}

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
                  msg.uid?.toString() === myId?.toString()) &&  // ← uid 비교만 추가
                isLoggedIn;

              return (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  onImageClick={handleImageClick}
                  isMine={isMine}
                />
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 스크롤 버튼 */}
      {/* {showScrollButton && (
        <button className="scroll-btn" onClick={scrollToBottom}>
          ↓
        </button>
      )} */}

      {/* 고정된 이미지 업로드 바 (Portal로 document.body에 렌더링) */}
      {createPortal(
        <div className="chat-upload-fixed">
          <ImageUpload
            roomKey={roomKey}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>,
        document.body
      )}

      {/* 이미지 확대 모달 (Portal로 document.body에 렌더링) */}
      {selectedImage && createPortal(
        <div
          className="image-modal-overlay"
          onClick={(e) => {
            if (e.target.classList.contains("image-modal-overlay")) {
              closeModal();
            }
          }}
        >
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
        </div>,
        document.body
      )}
    </div>
  );
}