import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { usedItemChatApi } from '../api/usedItemChatApi';
import '../styles/ChatInput.css';

/**
 * 중고거래 채팅 입력창
 * - 응원 채팅 스타일 적용
 * - [📷] [텍스트 입력] [✈️] 레이아웃
 */
export default function UsedItemChatInput({ roomKey }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);

  // 텍스트 메시지 전송
  const handleSendMessage = async () => {
    if (!message.trim() || !roomKey || sending) return;

    try {
      setSending(true);
      await usedItemChatApi.sendTextMessage(roomKey, message.trim());
      setMessage(''); // 입력창 초기화
    } catch (err) {
      console.error('❌ 메시지 전송 실패:', err);
      alert('메시지 전송 실패: ' + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  // Enter 키로 전송
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 이미지 압축
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      console.log('원본 크기:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      const compressedFile = await imageCompression(file, options);
      console.log('압축 후 크기:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
      return new File([compressedFile], file.name, { type: compressedFile.type });
    } catch (error) {
      console.error('이미지 압축 실패:', error);
      return file;
    }
  };

  // 이미지 업로드
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !roomKey || sending) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    try {
      setSending(true);

      // 이미지 압축
      const compressedFile = await compressImage(file);

      // 10MB 초과 시 차단
      if (compressedFile.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하만 가능합니다.');
        return;
      }

      // 업로드
      await usedItemChatApi.uploadImage(roomKey, compressedFile);
      console.log('✅ 이미지 업로드 성공');

      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('❌ 이미지 업로드 실패:', err);
      alert('이미지 업로드 실패: ' + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  // 이미지 선택
  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="useditem-chat-input-bar">
      <div className="useditem-chat-input-container">
        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* 📷 이미지 버튼 */}
        <button
          onClick={handleImageSelect}
          disabled={sending}
          className="useditem-chat-btn"
          title="사진 선택"
        >
          <svg className="useditem-chat-btn-icon icon-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        {/* 텍스트 입력창 */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          disabled={sending}
          className="useditem-chat-text-input"
        />

        {/* ✈️ 전송 버튼 */}
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || sending}
          className={`useditem-chat-btn ${message.trim() && !sending ? 'send-btn-active' : ''}`}
          title="전송"
        >
          <svg
            className={`useditem-chat-btn-icon ${message.trim() && !sending ? 'icon-white' : 'icon-gray'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
