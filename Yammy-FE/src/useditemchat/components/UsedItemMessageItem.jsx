import { useState } from 'react';
import useAuthStore from '../../stores/authStore';

/**
 * 중고거래 채팅 메시지 아이템 (텍스트 + 이미지 지원)
 * - 내 메시지는 오른쪽 정렬
 * - 상대 메시지는 왼쪽 정렬
 */
export default function UsedItemMessageItem({ message, onImageClick }) {
  const user = useAuthStore((state) => state.user);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 내가 보낸 메시지인지 확인
  const isMine = user && message.uid === String(user.id);

  // 메시지 유효성 검사
  if (!message || (!message.message && !message.imageUrl)) {
    return null;
  }

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>

        {/* 닉네임 (상대방 메시지만 표시) */}
        {!isMine && (
          <span className="text-xs text-gray-500 mb-1 px-2">{message.nickname}</span>
        )}

        {/* 메시지 내용 */}
        <div className={`rounded-lg px-4 py-2 ${
          isMine
            ? 'bg-purple-500 text-white'
            : 'bg-gray-200 text-gray-800'
        }`}>

          {/* 텍스트 메시지 */}
          {message.type === 'text' && (
            <p className="break-words whitespace-pre-wrap">{message.message}</p>
          )}

          {/* 이미지 메시지 */}
          {message.type === 'image' && message.imageUrl && (
            <div className="relative">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-300 rounded">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
              <img
                src={message.imageUrl}
                alt="message"
                className={`max-w-full rounded cursor-pointer transition-opacity ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ maxHeight: '300px' }}
                onLoad={() => setImageLoaded(true)}
                onClick={() => onImageClick && onImageClick(message.imageUrl)}
              />
            </div>
          )}
        </div>

        {/* 시간 */}
        <span className="text-xs text-gray-400 mt-1 px-2">
          {message.createdAt?.toLocaleString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
