import apiClient from "../../api/apiClient"

// 전체 조회
export const getAllUsedItems = async (page = 0, size = 10, sort = 'createdAt,desc') => {
  const res = await apiClient.get(`/trades?page=${page}&size=${size}&sort=${sort}`)
  return res.data.content // Page 객체에서 content만 가져오기
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
export const searchUsedItems = async ({ keyword = "", team = "", page = 0, size = 10 }) => {
  const res = await apiClient.get(`/trades/search`, {
    params: { keyword, team, page, size },
  })
  return res.data
}
