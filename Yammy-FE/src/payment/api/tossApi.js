import axios from "axios"

const BASE_URL = "http://localhost:8080/api"

export async function confirmTossPayment(token, tossBody) {
  const response = await axios.post(`${BASE_URL}/payments/confirm`, tossBody, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}
