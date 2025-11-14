import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { usedItemChatApi } from '../api/usedItemChatApi';
import '../styles/UsedItemChatInput.css';

/**
 * 중고거래 채팅 입력창
 * - 응원 채팅 스타일 적용
 */
export default function UsedItemChatInput({ roomKey, disabled = false }) {
  const [message, setMessage] = useState(''); // 입력 중인 메시지
  const [sending, setSending] = useState(false); // 전송 중 여부
  const fileInputRef = useRef(null); // 숨겨진 파일 입력 참조

  // 텍스트 메시지 전송
  const handleSendMessage = async () => {
    if (!message.trim() || !roomKey || sending || disabled) return;

    try {
      setSending(true);
      await usedItemChatApi.sendTextMessage(roomKey, message.trim());
      setMessage(''); // 입력창 초기화
    } catch (err) {
      console.error('메시지 전송 실패:', err);
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
    const file = e.target.files?.[0]; // 선택한 파일
    if (!file || !roomKey || sending || disabled) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    try {
      setSending(true);
      
      // GIF 파일은 압축하지 않고 원본 사용 (애니메이션 유지)
      let compressedFile;
      if (file.type === 'image/gif') {
        compressedFile = file;  // 일단 원본 사용
        
        // GIF가 10MB 넘으면 정적 이미지로 압축
        if (compressedFile.size > 10 * 1024 * 1024) {
          console.log("GIF 파일이 10MB를 초과하여 압축합니다.");
          compressedFile = await compressImage(file);  // 압축 (애니메이션 손실)
        }
      } else {
        compressedFile = await compressImage(file);  // 다른 이미지만 압축
      }

      // 압축 후에도 10MB 초과 시 차단
      if (compressedFile.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하만 가능합니다.');
        return;
      }

      await usedItemChatApi.uploadImage(roomKey, compressedFile); // 업로드
      console.log('이미지 업로드 성공');

      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // 초기화
      }
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
      alert('이미지 업로드 실패: ' + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  // 이미지 선택
  const handleImageSelect = () => {
    fileInputRef.current?.click(); // 클릭 트리거
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

        {/* 이미지 버튼 */}
        <button
          onClick={handleImageSelect}
          disabled={sending || disabled}
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
          placeholder={disabled ? "채팅방을 나간 사용자가 있습니다" : "메시지를 입력하세요..."}
          disabled={sending || disabled}
          className="useditem-chat-text-input"
        />

        {/* 전송 버튼 */}
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || sending || disabled}
          className={`useditem-chat-btn ${message.trim() && !sending && !disabled ? 'send-btn-active' : ''}`}
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
