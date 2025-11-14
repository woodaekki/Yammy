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
      const originalSize = (file.size / 1024 / 1024).toFixed(2);
      console.log("[ImageUpload] 이미지 압축 시작:", {
        fileName: file.name,
        originalSize: `${originalSize}MB`,
        type: file.type
      });

      const compressedFile = await imageCompression(file, options);
      const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);

      console.log("[ImageUpload] 이미지 압축 완료:", {
        fileName: file.name,
        originalSize: `${originalSize}MB`,
        compressedSize: `${compressedSize}MB`,
        compressionRatio: `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`
      });

      return new File([compressedFile], file.name, { type: compressedFile.type }); // 이름 유지
    } catch (error) {
      console.error("[ImageUpload] 이미지 압축 실패:", {
        fileName: file.name,
        error: error.message,
        stack: error.stack
      });
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
      // GIF 파일은 압축하지 않고 원본 사용 (애니메이션 유지)
      let compressedFile;
      if (file.type === 'image/gif') {
        compressedFile = file;  // 일단 원본 사용
        
        // GIF가 10MB 넘으면 정적 이미지로 압축
        if (compressedFile.size > 10 * 1024 * 1024) {
          console.log("[ImageUpload] GIF 파일이 10MB를 초과하여 압축합니다:", {
            fileName: file.name,
            originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`
          });
          compressedFile = await compressImage(file);  // 압축 (애니메이션 손실)
        }
      } else {
        compressedFile = await compressImage(file);  // 다른 이미지만 압축
      }

      // 압축 후에도 10MB 초과 시 차단
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
      console.error("[ImageUpload] 이미지 업로드 실패:", {
        fileName: file.name,
        roomKey,
        error: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
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
