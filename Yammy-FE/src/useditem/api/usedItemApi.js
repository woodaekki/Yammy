import axios from "axios"
const BASE_URL = "http://k13c205.p.ssafy.io:8080/api"

// 전체 조회
export const getAllUsedItems = async () => {
  const res = await axios.get(`${BASE_URL}/trades`)
  return res.data
}

// 단건 조회
export const getUsedItemById = async (id) => {
  const res = await axios.get(`${BASE_URL}/trades/${id}`)
  return res.data
}

// 작성
export const createUsedItem = async (itemData) => {
  const res = await axios.post("http://k13c205.p.ssafy.io:8080/api/trades", {
    ...itemData,
    nickname: "익명 사용자" // 회원 가입 후 추후 변경 예정
  })
  return res.data
}

// 수정
export const updateUsedItem = async (id, itemData) => {
  const res = await axios.put(`${BASE_URL}/trades/${id}`, itemData)
  return res.data
}

// 삭제
export const deleteUsedItem = async (id) => {
  await axios.delete(`${BASE_URL}/trades/${id}`)
}
