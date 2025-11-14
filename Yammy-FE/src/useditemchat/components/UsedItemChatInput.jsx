import { useState, useRef, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { usedItemChatApi } from "../api/usedItemChatApi";
import "../styles/UsedItemChatInput.css";

export default function UsedItemChatInput({ roomKey, disabled = false }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // 모바일 체크
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  /** ================================
   * textarea 자동 높이 조절 (카톡 스타일)
   ================================== */
  useEffect(() => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;

    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }, [message]);

  /** ================================
   * 텍스트 메시지 전송
   ================================== */
  const sendMessage = async () => {
    if (!message.trim() || sending || disabled) return;

    try {
      setSending(true);
      await usedItemChatApi.sendTextMessage(roomKey, message.trim());
      setMessage("");
    } catch (err) {
      console.error("메시지 전송 실패:", err);
      alert(err.response?.data?.message || "메시지 전송 실패");
    } finally {
      setSending(false);
    }
  };

  /** ================================
   * 엔터 ↔ 개행 / 전송 처리
   ================================== */
  const handleKeyDown = (e) => {
    if (isMobile) return; // 모바일은 Enter = 개행

    if (e.key === "Enter") {
      if (!e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    }
  };

  /** ================================
   * 이미지 압축 (GIF 예외 처리 포함)
   ================================== */
  const compressImage = async (file) => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressed = await imageCompression(file, options);
      return new File([compressed], file.name, { type: compressed.type });
    } catch (error) {
      console.error("이미지 압축 실패:", error);
      return file;
    }
  };

  /** ================================
   * 이미지 업로드
   ================================== */
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || sending || disabled) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    try {
      setSending(true);

      let processedFile = file;

      if (file.type !== "image/gif") {
        processedFile = await compressImage(file);
      } else if (file.size > 10 * 1024 * 1024) {
        processedFile = await compressImage(file); // GIF → 정적 이미지
      }

      if (processedFile.size > 10 * 1024 * 1024) {
        alert("이미지는 10MB 이하만 가능합니다.");
        return;
      }

      await usedItemChatApi.uploadImage(roomKey, processedFile);

      fileInputRef.current.value = "";
    } catch (err) {
      console.error("이미지 업로드 실패:", err);
      alert(err.response?.data?.message || "이미지 업로드 실패");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="useditem-chat-input-bar">
      <div className="useditem-chat-input-container">
        {/* 숨겨진 파일 input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* 이미지 버튼 */}
        <button
          className="useditem-chat-btn"
          disabled={sending || disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg className="useditem-chat-btn-icon icon-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>

        {/* textarea 입력 */}
        <textarea
          ref={textareaRef}
          className="useditem-chat-text-input"
          value={message}
          disabled={sending || disabled}
          placeholder={
            disabled ? "채팅방을 나간 사용자가 있습니다" : "메시지를 입력하세요..."
          }
          onKeyDown={handleKeyDown}
          onChange={(e) => setMessage(e.target.value)}
          rows={1}
        />

        {/* 전송 버튼 */}
        <button
          className={`useditem-chat-btn ${
            message.trim() && !sending && !disabled ? "send-btn-active" : ""
          }`}
          disabled={!message.trim() || sending || disabled}
          onClick={sendMessage}
        >
          <svg
            style={{ transform: "rotate(90deg)" }}
            className={`useditem-chat-btn-icon ${
              message.trim() && !sending ? "icon-white" : "icon-gray"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
