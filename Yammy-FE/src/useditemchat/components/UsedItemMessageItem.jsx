import { useState, useEffect } from 'react';
import useAuthStore from '../../stores/authStore';
import EscrowMessageItem from './EscrowMessageItem';
import '../styles/UsedItemMessageItem.css';

/**
 * 중고거래 채팅 메시지 아이템 (카카오톡 스타일)
 * - 내 메시지 오른쪽, 상대방 왼쪽
 * - 닉네임 위 / 시간은 말풍선 옆
 */
export default function UsedItemMessageItem({ message }) {
  const user = useAuthStore((state) => state.user);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomImage, setZoomImage] = useState(null); 
  const isMine = user && message.uid === String(user.memberId);

  useEffect(() => {
  if (zoomImage) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }
}, [zoomImage]);

  // 에스크로 메시지 처리
  if (message.type === 'escrow') {
    return <EscrowMessageItem message={message} isMine={isMine} />;
  }

  // 빈 메시지 방어
  if (!message || (!message.message && !message.imageUrl)) {
    return null;
  }

  return (
    <>
      <div className={`chat-row ${isMine ? 'mine' : 'theirs'}`}>
        <div className="chat-content">
          {/* === 닉네임 === */}
          <span className="chat-nickname">
            {message.nickname || (isMine ? user?.nickname : '')}
          </span>

          {/* === 말풍선 + 시간 === */}
          <div className="chat-bubble-wrapper">
            <div className={`chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
              {message.type === 'text' && (
                <p className="chat-text">{message.message}</p>
              )}

              {message.type === 'image' && message.imageUrl && (
                <div className="chat-image-wrapper">
                  {!imageLoaded && (
                    <div className="chat-image-loading">
                      <div className="chat-spinner"></div>
                    </div>
                  )}
                  <img
                    src={message.imageUrl}
                    alt="message"
                    className={`chat-image ${imageLoaded ? 'visible' : ''}`}
                    onLoad={() => setImageLoaded(true)}
                    onClick={() => setZoomImage(message.imageUrl)} 
                  />
                </div>
              )}
            </div>

            {/* === 시간 (말풍선 옆) === */}
            <span className="chat-time">
              {message.createdAt
                ? new Date(message.createdAt).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })
                : ''}
            </span>
          </div>
        </div>
      </div>

      {/* 이미지 확대 모달 (카톡 스타일 + X버튼 + 배경 클릭 닫기) */}
      {zoomImage && (
        <div
          className="chat-image-overlay"
          onClick={(e) => {
            // 배경 클릭 시만 닫히게 (이미지 클릭은 무시)
            if (e.target.classList.contains('chat-image-overlay')) {
              setZoomImage(null);
            }
          }}
        >
          <button
            className="chat-image-close"
            onClick={() => setZoomImage(null)}
          >
            ✕
          </button>
          <img src={zoomImage} alt="zoom" className="chat-image-zoomed" />
        </div>
      )}
    </>
  );
}
