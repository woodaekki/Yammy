import { useState } from "react"
import { usePhotoUpload } from "../hooks/usePhotoUpload"
import "../styles/usedItem.css"

function PhotoUploader({ onUploaded }) {
  const { uploadPhotos, uploading } = usePhotoUpload()
  const [uploadedUrls, setUploadedUrls] = useState([])

  // 파일 선택 시 실행
  async function handleFileChange(event) {
    const files = Array.from(event.target.files)

    // 최대 3장까지 업로드 가능
    if (uploadedUrls.length + files.length > 3) {
      alert("이미지는 최대 3장까지만 업로드할 수 있습니다")
      return
    }

    try {
      const result = await uploadPhotos(files)
      const newUrls = [...uploadedUrls, ...result.fileUrls]
      setUploadedUrls(newUrls)

      // 게시글 작성 페이지로 전달
      onUploaded({
        photoIds: result.photoIds,
        fileUrls: newUrls
      })
    } catch (err) {
      alert("사진 업로드 중 오류가 발생했습니다")
      console.error(err)
    }
  }

  function handleRemove(index) {
    const newList = uploadedUrls.filter((url, i) => {
      return i !== index
    })
    setUploadedUrls(newList)
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
            <img src={url} alt={`uploaded-${index}`} className="photo-preview-img" />
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
