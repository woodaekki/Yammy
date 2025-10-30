import axios from "axios"
const BASE_URL = "http://k13c205.p.ssafy.io:8080/api/photos"

// presigned URL 여러 개 요청
export const getPresignedUrls = async (photoRequests) => {
  const res = await axios.post(`${BASE_URL}/presignedUrls`, photoRequests)
  return res.data
}

// 업로드 완료 
export const completeUpload = async (completeRequest) => {
  const res = await axios.post(`${BASE_URL}/complete`, completeRequest)
  return res.data
}

// 사진 삭제
export const deletePhoto = async (photoId) => {
  await axios.delete(`${BASE_URL}/${photoId}`)
}
