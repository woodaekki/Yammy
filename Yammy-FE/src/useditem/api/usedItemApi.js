import apiClient from "../../api/apiClient"

// 전체 조회
export const getAllUsedItems = async () => {
  const res = await apiClient.get(`/trades`)
  return res.data
}

// 단건 조회
export const getUsedItemById = async (id) => {
  const res = await apiClient.get(`/trades/${id}`)
  return res.data
}

// 작성
export const createUsedItem = async (itemData) => {
  const res = await apiClient.post(`/trades`, itemData)
  return res.data
}

// 수정
export const updateUsedItem = async (id, itemData) => {
  const res = await apiClient.put(`/trades/${id}`, itemData)
  return res.data
}

// 삭제
export const deleteUsedItem = async (id) => {
  await apiClient.delete(`/trades/${id}`)
}

// 팀 또는 키워드 검색
export const searchUsedItems = async ({ keyword = "", team = "" }) => {
  const res = await apiClient.get(`/trades/search`, {
    params: { keyword, team },
  })
  return res.data
}
