import { useEffect, useState } from "react"
import { getWithdrawHistory } from "../withdrawal/api/withdrawalApi"

const WithdrawalHistoryPage = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const res = await getWithdrawHistory()
      setHistory(res)  // 자동으로 토큰 포함해서 백엔드 요청됨
    } catch (err) {
      console.error("환전 내역 불러오기 실패:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>불러오는 중...</div>

  return (
    <div>
      <h2>환전 내역</h2>
      {history.length === 0 ? (
        <p>내역 없음</p>
      ) : (
        history.map((w) => (
          <div key={w.id}>
            <p>금액: {w.amount}</p>
            <p>상태: {w.status}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default WithdrawalHistoryPage
