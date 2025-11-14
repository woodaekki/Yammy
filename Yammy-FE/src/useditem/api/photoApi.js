import apiClient from "../../api/apiClient"

// presigned URL 요청 
export const getPresignedUrls = async (files, prefix = 'useditem') => {
  const count = files.length
  const contentType = files[0].type
  const res = await apiClient.post(
    `/photos/presignedUrls?count=${count}&contentType=${encodeURIComponent(contentType)}&prefix=${prefix}`
  )
  return res.data
}

// 업로드 완료
export const completeUpload = async (completeRequest) => {
  const res = await apiClient.post(`/photos/complete`, completeRequest)
  return res.data
}

// 사진 삭제
export const deletePhoto = async (photoId) => {
  await apiClient.delete(`/photos/${photoId}`)
}
