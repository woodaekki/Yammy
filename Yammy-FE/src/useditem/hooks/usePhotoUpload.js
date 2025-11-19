import { useState } from "react"
import { getPresignedUrls, completeUpload } from "../api/photoApi"
import imageCompression from "browser-image-compression"

export const usePhotoUpload = () => {
  const [uploading, setUploading] = useState(false) // 업로드 중인지 표시
  const [uploadedUrls, setUploadedUrls] = useState([]) // 업로드된 이미지 주소 저장

  // 파일 업로드 전체 처리 (압축 → presigned → S3 업로드 → DB 저장)
  async function uploadPhotos(files) {
    setUploading(true)

    const uploadedIds = []
    const uploadedFileUrls = []

    try {
      // 파일 압축 단계
      const compressOptions = {
        maxSizeMB: 5,              // 업로드 목표 용량
        maxWidthOrHeight: 2000,    // 대형 이미지 OOM 방지
        useWebWorker: true
      }

      const compressedFiles = await Promise.all(
        Array.from(files).map(async (file) => {
          if (file.size > 10 * 1024 * 1024) {
            // console.log("압축 필요:", file.name, file.size)

            try {
              const compressed = await imageCompression(file, compressOptions)
              // console.log(`압축 완료: ${file.size} → ${compressed.size}`)
              return compressed
            } catch (err) {
              console.error("이미지 압축 실패:", err)
              alert("이미지 압축 중 오류가 발생했습니다.")
              throw err
            }
          }
          return file // 10MB 미만은 원본 유지
        })
      )

      // 압축된 파일 기준으로 Presigned URL 요청
      const presignedList = await getPresignedUrls(compressedFiles)

      // S3 업로드 (순차 실행)
      let chain = Promise.resolve()

      presignedList.forEach((presigned, idx) => {
        chain = chain
          .then(async () => {
            const file = compressedFiles[idx]

            await fetch(presigned.presignedUrl, {
              method: "PUT",
              headers: { "Content-Type": file.type },
              body: file
            })
          })
          .then(() => {
            const file = compressedFiles[idx]

            const info = {
              s3Key: presigned.s3Key,
              fileUrl: presigned.presignedUrl.split("?")[0],
              contentType: file.type
            }

            return completeUpload(info)
          })
          .then((res) => {
            uploadedIds.push(res.photoId)
            uploadedFileUrls.push(res.fileUrl)
          })
      })

      await chain

      const result = {
        photoIds: uploadedIds,
        fileUrls: uploadedFileUrls
      }

      setUploadedUrls(uploadedFileUrls)
      return result

    } catch (error) {
      console.error("사진 업로드 실패:", error)
      alert("사진 업로드 중 오류가 발생했습니다.")
      throw error
    } finally {
      setUploading(false)
    }
  }

  return { uploading, uploadedUrls, uploadPhotos }
}
