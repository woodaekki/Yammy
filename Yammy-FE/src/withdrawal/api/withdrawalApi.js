import apiClient from "../../api/apiClient"

export const requestWithdraw = async (data) => {
  const res = await apiClient.post("/withdraw/request", data)
  return res.data
}

export const getWithdrawHistory = async () => {
  const res = await apiClient.get("/withdraw/history")
  return res.data
}
