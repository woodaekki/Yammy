import imageCompression from "browser-image-compression";
import { useRef } from "react";
import { chatMessageApi } from "../api/chatApi";
import "../styles/ImageUpload.css";

export default function ImageUpload({ roomKey, apiUploadFunction }) {
  const fileRef = useRef(null);

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1, // 최대 1MB
      maxWidthOrHeight: 1920, // 최대 1920px
      useWebWorker: true, // 성능 향상
    };

    try {
      console.log("원본 크기:", (file.size / 1024 / 1024).toFixed(2), "MB");
      const compressedFile = await imageCompression(file, options);
      console.log("압축 후 크기:", (compressedFile.size / 1024 / 1024).toFixed(2), "MB");
      return new File([compressedFile], file.name, { type: compressedFile.type }); // 이름 유지
    } catch (error) {
      console.error("이미지 압축 실패:", error);
      return file; // 압축 실패 시 원본 사용
    }
  };

  const handleSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    try {
      // ★ 추가: 압축 수행
      const compressedFile = await compressImage(file);

      // 10MB 초과 시 차단 (압축 후 기준)
      if (compressedFile.size > 10 * 1024 * 1024) {
        alert("파일 크기는 10MB 이하만 가능합니다.");
        return;
      }

      // 업로드 함수 호출 (커스텀 함수가 있으면 사용, 없으면 기본 chatMessageApi 사용)
      if (apiUploadFunction) {
        await apiUploadFunction(compressedFile);
      } else {
        await chatMessageApi.uploadImage(roomKey, compressedFile);
      }
    } catch (err) {
      alert("업로드 실패");
      console.error(err);
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
