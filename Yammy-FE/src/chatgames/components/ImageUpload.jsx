import { useState, useRef } from 'react';
import { chatMessageApi } from '../api/chatApi';

/**
 * 이미지 업로드 컴포넌트
 * @param {string} roomKey - 채팅방 키
 * @param {Function} onUploadSuccess - 업로드 성공 콜백
 * @param {Function} onUploadError - 업로드 실패 콜백
 */
export default function ImageUpload({ roomKey, onUploadSuccess, onUploadError }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // 파일 선택 핸들러
  const handleFileSelect = (event) => {
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

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // 자동 업로드
    handleUpload(file);
  };

  // 업로드 처리
  const handleUpload = async (file) => {
    try {
      setUploading(true);
      console.log('📤 이미지 업로드 시작:', file.name);

      const result = await chatMessageApi.uploadImage(roomKey, file);

      console.log('✅ 업로드 성공:', result);
      setPreview(null); // 미리보기 초기화
      fileInputRef.current.value = ''; // input 초기화

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

  // 취소 버튼
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
          {!uploading && (
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
          disabled={uploading}
          className="hidden"
          id="image-upload"
        />
        
        <label
          htmlFor="image-upload"
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
            uploading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>업로드 중...</span>
            </>
          ) : (
            <>
              {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg> */}
              <span className="font-semibold">이미지 선택</span>
            </>
          )}
        </label>
      </div>

      {/* 안내 문구 */}
      <p className="text-xs text-gray-500 mt-2 text-center">
        10MB 이하의 이미지 파일 (JPG, PNG, GIF 등)
      </p>
    </div>
  );
}