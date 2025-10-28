import { useState } from "react"
import { getPresignedUrls, completeUpload } from "../api/photoApi"

export const usePhotoUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadedPhotos, setUploadedPhotos] = useState([])

  // 회원 가입 코드 완료 시 추후 수정 예정
  const uploadPhotos = (files, memberId = 1) => {
    setUploading(true)

    // presigned URL 요청
    const requests = files.map((file) => ({
      memberId,
      originalFilename: file.name,
      contentType: file.type
    }))

    return getPresignedUrls(requests)
      .then((presignedList) => {
        // 실제 S3 업로드
        const uploadTasks = presignedList.map((urlObj, idx) => {
          return fetch(urlObj.presignedUrl, {
            method: "PUT",
            headers: { "Content-Type": files[idx].type },
            body: files[idx]
          })
        })

        return Promise.all(uploadTasks).then(() => presignedList)
      })
      .then((presignedList) => {
        // 업로드 완료 API 호출
        const completeReq = { fileUrls: presignedList.map((p) => p.fileUrl) }
        return completeUpload(completeReq)
      })
      .then((completeRes) => {
        setUploadedPhotos(completeRes.fileUrls)
        return completeRes
      })
      .catch((err) => {
        console.error("사진 업로드 실패:", err)
        throw err
      })
      .finally(() => {
        setUploading(false)
      })
  }

  return { uploading, uploadedPhotos, uploadPhotos }
}
