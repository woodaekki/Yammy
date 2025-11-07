import { useState } from 'react';
import useAuthStore from '../../stores/authStore';
import '../styles/UsedItemMessageItem.css';

/**
 * 중고거래 채팅 메시지 아이템 (양끝 정렬 완전 버전)
 * - 내 메시지는 오른쪽 끝
 * - 상대 메시지는 왼쪽 끝
 */
export default function UsedItemMessageItem({ message, onImageClick }) {
  const user = useAuthStore((state) => state.user);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isMine = user && message.uid === String(user.id);

  if (!message || (!message.message && !message.imageUrl)) {
    return null;
  }

  return (
    <div className={`chat-row ${isMine ? 'mine' : 'theirs'}`}>
      <div className="chat-content">
        {!isMine && <span className="chat-nickname">{message.nickname}</span>}

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
                onClick={() => onImageClick && onImageClick(message.imageUrl)}
              />
            </div>
          )}
        </div>

        <span className="chat-time">
          {message.createdAt?.toLocaleString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
