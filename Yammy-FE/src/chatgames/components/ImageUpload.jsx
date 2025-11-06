import { useState, useRef } from 'react';
import { chatMessageApi } from '../api/chatApi';
import imageCompression from 'browser-image-compression';  // ← 추가!

/**
 * 이미지 업로드 컴포넌트
 * @param {string} roomKey - 채팅방 키
 * @param {Function} onUploadSuccess - 업로드 성공 콜백
 * @param {Function} onUploadError - 업로드 실패 콜백
 */
export default function ImageUpload({ roomKey, onUploadSuccess, onUploadError }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [compressing, setCompressing] = useState(false);  // ← 추가!
  const fileInputRef = useRef(null);

  // 이미지 압축 함수 ← 추가!
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,          // 최대 1MB
      maxWidthOrHeight: 1920, // 최대 1920px
      useWebWorker: true,     // 웹 워커 사용 (성능 향상)
    };

    try {
      console.log('원본 크기:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      const compressedFile = await imageCompression(file, options);
      console.log('압축 후 크기:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
      return compressedFile;
    } catch (error) {
      console.error('이미지 압축 실패:', error);
      return file; // 압축 실패 시 원본 반환
    }
  };

  // 파일 선택 핸들러 (수정)
  const handleFileSelect = async (event) => {  // ← async 추가
    const file = event.target.files[0];
    if (!file) return;

    // 이미지 파일 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하만 가능합니다.');
      return;
    }

    try {
      // 압축 시작 ← 추가!
      setCompressing(true);
      const compressedFile = await compressImage(file);
      setCompressing(false);

      // 미리보기 생성 (압축된 파일로)
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);

      // 자동 업로드 (압축된 파일로)
      handleUpload(compressedFile);
    } catch (error) {
      console.error('압축 중 오류:', error);
      setCompressing(false);
      alert('이미지 처리 중 오류가 발생했습니다.');
    }
  };

  // 업로드 처리 (그대로)
  const handleUpload = async (file) => {
    try {
      setUploading(true);
      console.log('📤 이미지 업로드 시작:', file.name);

      const result = await chatMessageApi.uploadImage(roomKey, file);

      console.log('✅ 업로드 성공:', result);
      setPreview(null);
      fileInputRef.current.value = '';

      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (error) {
      console.error('❌ 업로드 실패:', error);
      
      if (onUploadError) {
        onUploadError(error);
      } else {
        alert('이미지 업로드 실패: ' + error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  // 취소 버튼 (그대로)
  const handleCancel = () => {
    setPreview(null);
    fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {/* 미리보기 */}
      {preview && (
        <div className="mb-4 relative">
          <img
            src={preview}
            alt="preview"
            className="max-h-40 rounded mx-auto"
          />
          {!uploading && !compressing && (  // ← 수정!
            <button
              onClick={handleCancel}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* 업로드 버튼 */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading || compressing}  // ← 수정!
          className="hidden"
          id="image-upload"
        />
        
        <label
          htmlFor="image-upload"
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
            uploading || compressing  // ← 수정!
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {compressing ? (  // ← 추가!
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>압축 중...</span>
            </>
          ) : uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>업로드 중...</span>
            </>
          ) : (
            <>
              <span className="font-semibold">이미지 선택</span>
            </>
          )}
        </label>
      </div>

      {/* 안내 문구 (수정) */}
      <p className="text-xs text-gray-500 mt-2 text-center">
        10MB 이하의 이미지 파일 (자동 압축 후 업로드)
      </p>
    </div>
  );
}