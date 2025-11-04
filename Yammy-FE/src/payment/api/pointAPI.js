import axios from "axios"

const BASE_URL = "http://localhost:8080/api"

export async function getMyPoint(token) {
  const response = await axios.get(`${BASE_URL}/points/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

