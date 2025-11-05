import { useState } from 'react';

/**
 * 개별 메시지 카드 컴포넌트
 * @param {Object} message - 메시지 객체 { id, uid, imageUrl, createdAt }
 * @param {Function} onImageClick - 이미지 클릭 핸들러 (확대 보기용)
 */
export default function MessageItem({ message, onImageClick }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* 이미지 */}
      <div className="relative mb-2">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        <img
          src={message.imageUrl}
          alt="chat"
          className={`max-w-full rounded cursor-pointer hover:opacity-90 transition-opacity ${
            imageLoaded ? 'block' : 'hidden'
          }`}
          style={{ maxHeight: '400px' }}
          onClick={() => onImageClick && onImageClick(message.imageUrl)}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />
      </div>

      {/* 메시지 정보 */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          <span className="font-semibold">{message.nickname || message.uid} </span>
        </span>
        <span className="text-gray-400 text-xs">
          {message.createdAt?.toLocaleString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  );
}