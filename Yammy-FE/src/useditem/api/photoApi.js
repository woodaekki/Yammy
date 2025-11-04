import axios from "axios"

const BASE_URL = "http://localhost:8080/api/photos"

// 토큰 가져오기
const axiosWithAuth = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

axiosWithAuth.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config;
  },
  (error) => Promise.reject(error)
)

// presigned URL 요청
export const getPresignedUrls = async (files) => {
  const count = files.length
  const contentType = files[0].type
  const res = await axiosWithAuth.post(
    `/presignedUrls?count=${count}&contentType=${encodeURIComponent(contentType)}`
  )
  return res.data
}

// 업로드 완료
export const completeUpload = async (completeRequest) => {
  const res = await axiosWithAuth.post(`/complete`, completeRequest)
  return res.data
}


// 사진 삭제
export const deletePhoto = async (photoId) => {
  await axiosWithAuth.delete(`/${photoId}`)
}
