import apiClient from "../../api/apiClient"

export async function getMyPoint() {
  const response = await apiClient.get(`/points/me`)
  return response.data
}

