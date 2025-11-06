import { useRef } from "react";
import { chatMessageApi } from "../api/chatApi";
import "../styles/ImageUpload.css";

export default function ImageUpload({ roomKey }) {
  const fileRef = useRef(null);

  const handleSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    try {
      await chatMessageApi.uploadImage(roomKey, file);
    } catch (err) {
      alert("업로드 실패");
    } finally {
      fileRef.current.value = "";
    }
  };

  const triggerUpload = () => {
    fileRef.current.click();
  };

  return (
    <div className="upload-area">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelect}
      />
      <div className="upload-input" onClick={triggerUpload}>
        <svg
          className="upload-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>사진 선택</span>
      </div>
    </div>
  );
}
