import { useState } from "react";
import "../styles/usedItem.css";

function PhotoUploader({ 
  existingCount = 0,      // 기존 이미지 개수
  onFilesSelected,        // 새 파일 업로드
  onRemoveExisting        // 기존 파일 삭제
}) {
  const [files, setFiles] = useState([]);            // 새 파일 목록
  const [previewUrls, setPreviewUrls] = useState([]); // 새 파일 미리보기

  const totalCount = existingCount + files.length;
  const canUploadMore = totalCount < 3;

  function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files);

    if (!canUploadMore) {
      alert("이미지는 최대 3장까지만 등록할 수 있습니다.");
      return;
    }

    // 추가 선택 후 총합 계산
    if (totalCount + selectedFiles.length > 3) {
      alert("이미지는 최대 3장까지만 등록할 수 있습니다.");
      return;
    }

    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);

    const newPreviews = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviewUrls((prev) => [...prev, ...newPreviews]);

    onFilesSelected(newFiles);
  }

  function handleRemoveNew(index) {
    URL.revokeObjectURL(previewUrls[index]);

    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);

    setFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);

    onFilesSelected(updatedFiles);
  }

  return (
    <div className="photo-uploader">
      {/* 업로드 개수 안내 */}
      <p style={{ fontSize: "0.85rem", color: "#555", marginBottom: "0.3rem" }}>
        {totalCount} / 3 장 등록됨
      </p>

      {/* 파일 선택 */}
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        disabled={!canUploadMore}
      />

      {/* 신규 이미지 미리보기 */}
      <div className="photo-preview-list">
        {previewUrls.map((url, index) => (
          <div key={index} className="photo-preview-item">
            <img src={url} alt={"preview-" + index} className="photo-preview-img" />

            {/* 신규 이미지 삭제 */}
            <button
              type="button"
              className="photo-remove-btn"
              onClick={() => handleRemoveNew(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PhotoUploader;
