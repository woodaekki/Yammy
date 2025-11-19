import { useState } from "react"
import "../styles/usedItem.css"

function PhotoUploader({ onFilesSelected, existingCount = 0 }) {
  const [files, setFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])

  // 진짜 PNG인지 검사
  async function isRealPng(file) {
    try {
      const buffer = await file.slice(0, 8).arrayBuffer()
      const header = new Uint8Array(buffer)

      if (header.length < 8) return false

      const pngHeader = new Uint8Array([
        0x89, 0x50, 0x4E, 0x47,
        0x0D, 0x0A, 0x1A, 0x0A
      ])

      for (let i = 0; i < 8; i++) {
        if (header[i] !== pngHeader[i]) return false
      }

      return true
    } catch (e) {
      console.error("PNG 검사 오류:", e)
      return false
    }
  }

  // 파일 선택
  async function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files || [])
    if (selectedFiles.length === 0) return

    for (const file of selectedFiles) {
      const ext = file.name.split(".").pop().toLowerCase()

      const isImage = file.type.startsWith("image/")
      if (!isImage) {
        alert("이미지 파일만 업로드 가능합니다.")
        event.target.value = ""
        return
      }

      // PNG인 경우에만 헤더 검사
      if (ext === "png") {
        const real = await isRealPng(file)
        if (!real) {
          alert("유효하지 않은 이미지 파일이 포함되어 있습니다.")
          event.target.value = ""
          return
        }
      }
    }

    // 최대 3장 제한
    const totalCount = existingCount + files.length + selectedFiles.length
    if (totalCount > 3) {
      alert("최대 3장까지 업로드 가능")
      event.target.value = ""
      return
    }

    const newFiles = [...files, ...selectedFiles]
    setFiles(newFiles)

    const newPreviews = selectedFiles.map(f => URL.createObjectURL(f))
    setPreviewUrls(prev => [...prev, ...newPreviews])

    onFilesSelected(newFiles)
    event.target.value = ""
  }

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
      <div className="photo-count-text">
        업로드 수: {existingCount + files.length} / 3
      </div>

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
