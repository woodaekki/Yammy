import { useState } from "react"
import "../styles/usedItem.css"

function PhotoUploader({ onFilesSelected, existingCount = 0 }) {
  const [files, setFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])

  // 파일 선택 처리
  async function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files)

    // 3장 제한 체크
    const totalCount = existingCount + files.length + selectedFiles.length
    if (totalCount > 3) {
      alert("이미지는 최대 3장까지만 업로드할 수 있습니다.")
      return
    }

    // 파일 저장
    const newFiles = [...files, ...selectedFiles]
    setFiles(newFiles)

    // 미리보기 생성
    const newPreviews = selectedFiles.map((f) => URL.createObjectURL(f))
    setPreviewUrls((prev) => [...prev, ...newPreviews])

    onFilesSelected(newFiles)
  }

  // 파일 제거
  function handleRemove(index) {
    URL.revokeObjectURL(previewUrls[index])

    const updatedFiles = files.filter((_, i) => i !== index)
    const updatedPreviews = previewUrls.filter((_, i) => i !== index)

    setFiles(updatedFiles)
    setPreviewUrls(updatedPreviews)

    onFilesSelected(updatedFiles)
  }

  return (
    <div className="photo-uploader">
      {/* 사진 수 표시 */}
      <div className="photo-count-text">
        업로드 수: {existingCount + files.length} / 3
      </div>

      {/* 새로 추가된 사진 리스트 */}
      <div className="photo-preview-list">
        {previewUrls.map((url, index) => (
          <div key={index} className="image-card">
            <img src={url} alt={"preview-" + index} />
            <button
              type="button"
              className="image-remove-btn"
              onClick={() => handleRemove(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* 업로드 input */}
      <div className="photo-input">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={existingCount + files.length >= 3}
        />
      </div>
    </div>
  )
}

export default PhotoUploader
