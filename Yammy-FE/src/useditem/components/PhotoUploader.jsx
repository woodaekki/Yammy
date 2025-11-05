import { useState } from "react"
import { usePhotoUpload } from "../hooks/usePhotoUpload"
import "../styles/usedItem.css"

function PhotoUploader({ onUploaded }) {
  const { uploadPhotos, uploading } = usePhotoUpload()
  const [uploadedUrls, setUploadedUrls] = useState([])

  // 파일 선택 시 실행
  function handleFileChange(event) {
    const files = Array.from(event.target.files)

    // 업로드 제한 (최대 3장)
    if (uploadedUrls.length + files.length > 3) {
      alert("이미지는 최대 3장까지만 업로드할 수 있습니다")
      return;
    }

    // 업로드 시작
    uploadPhotos(files)
      .then((result) => {
        // 새로 업로드된 이미지 + 기존 이미지 합치기
        const newUrls = uploadedUrls.concat(result.fileUrls)
        setUploadedUrls(newUrls)

        // 부모 컴포넌트로 결과 전달
        onUploaded({
          photoIds: result.photoIds,
          fileUrls: newUrls,
        });
      })
      .catch((error) => {
        console.error("업로드 실패:", error)
        alert("사진 업로드 중 오류가 발생했습니다.")
      });
  }

  // 이미지 삭제
  function handleRemove(index) {
    const newList = uploadedUrls.filter((_, i) => i !== index)
    setUploadedUrls(newList)

    // 부모 컴포넌트로 업데이트된 이미지 목록 전달
    onUploaded({
      photoIds: [],
      fileUrls: newList,
    });
  }

  return (
    <div className="photo-uploader">
      {/* 파일 선택 영역 */}
      <div className="photo-input">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploadedUrls.length >= 3 || uploading}
        />
        {uploading && <p className="uploading-text">업로드 중...</p>}
      </div>

      {/* 업로드된 이미지 미리보기 */}
      <div className="photo-preview-list">
        {uploadedUrls.map((url, index) => (
          <div key={index} className="photo-preview-item">
            <img
              src={url}
              alt={"uploaded-" + index}
              className="photo-preview-img"
            />
            <button
              type="button"
              className="photo-remove-btn"
              onClick={() => handleRemove(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PhotoUploader
