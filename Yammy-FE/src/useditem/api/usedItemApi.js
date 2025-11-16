import apiClient from "../../api/apiClient"

// 전체 조회
export const getAllUsedItems = async (page = 0, size = 10, sort = 'createdAt,desc') => {
  const res = await apiClient.get(`/trades?page=${page}&size=${size}&sort=${sort}`)
  return res.data.content
}

// 단건 조회
export const getUsedItemById = async (id) => {
  const res = await apiClient.get(`/trades/${id}`)
  return res.data
}

// 작성 (FormData 방식 - 이미지와 데이터를 함께 전송)
export const createUsedItem = async (itemData, imageFiles) => {
  const formData = new FormData()
  
  // JSON 데이터를 Blob으로 감싸서 'data' 파트로 추가
  formData.append('data', new Blob([JSON.stringify(itemData)], { 
    type: 'application/json' 
  }))
  
  // 이미지 파일들을 'imageFiles' 파트로 추가
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach(file => {
      formData.append('imageFiles', file)
    })
  }
  
  // multipart/form-data로 전송 (Content-Type은 자동 설정됨)
  const res = await apiClient.post(`/trades`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
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
