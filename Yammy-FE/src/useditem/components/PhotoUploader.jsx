import { useState } from "react"
import "../styles/usedItem.css"

// 이미지 선택 및 미리보기 컴포넌트 (업로드는 게시글 등록 시점에 수행)
function PhotoUploader({ onFilesSelected }) {
  // 선택된 파일 목록
  const [files, setFiles] = useState([])
  // 로컬 미리보기 URL 목록
  const [previewUrls, setPreviewUrls] = useState([])

  // 파일 선택 시 실행
  function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files)

    // 최대 3장 제한 검사
    if (files.length + selectedFiles.length > 3) {
      alert("이미지는 최대 3장까지만 업로드할 수 있습니다")
      return
    }

    // 기존 파일에 새 파일 추가
    const newFiles = [...files, ...selectedFiles]
    setFiles(newFiles)

    // 로컬 미리보기 URL 생성 (서버 업로드 없이 브라우저에서 미리보기)
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
    const allPreviews = [...previewUrls, ...newPreviews]
    setPreviewUrls(allPreviews)

    // 부모 컴포넌트에 파일 목록과 미리보기 URL 전달
    onFilesSelected(newFiles, allPreviews)
  }

  // 이미지 삭제
  function handleRemove(index) {
    // 해당 인덱스의 파일과 미리보기 URL 제거
    const newFiles = files.filter((_, i) => i !== index)
    const newPreviews = previewUrls.filter((_, i) => i !== index)
    
    // 메모리 누수 방지를 위해 URL 해제
    URL.revokeObjectURL(previewUrls[index])
    
    setFiles(newFiles)
    setPreviewUrls(newPreviews)

    // 부모 컴포넌트에 업데이트된 목록 전달
    onFilesSelected(newFiles, newPreviews)
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
          disabled={files.length >= 3}
        />
      </div>

      {/* 선택된 이미지 미리보기 */}
      <div className="photo-preview-list">
        {previewUrls.map((url, index) => (
          <div key={index} className="photo-preview-item">
            <img
              src={url}
              alt={"preview-" + index}
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
