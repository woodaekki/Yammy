import apiClient from "../../api/apiClient";

export async function confirmTossPayment(tossBody) {
  const response = await apiClient.post(`/payments/confirm`, tossBody);
  return response.data;
}
