import api from "../../api/apiClient";

// 에스크로 송금 요청
export const deposit = async (roomKey, amount) => {
  const response = await api.post(`/escrow/${roomKey}`, {
    amount, 
  })
  return response.data
};

// 거래 확정 (포인트 지급)
export const confirmed = async (escrowId) => {
  const response = await api.post(`/escrow/${escrowId}/confirmed`)
  return response.data
};

// 거래 취소 
export const cancel = async (escrowId) => {
  const response = await api.post(`/escrow/${escrowId}/cancel`)
  return response.data
}
