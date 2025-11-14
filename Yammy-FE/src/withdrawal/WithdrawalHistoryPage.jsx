import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getWithdrawHistory } from "../withdrawal/api/withdrawalApi"
import { getMyPoint } from "../payment/api/pointAPI"
import "./styles/WithdrawalHistoryPage.css"

const WithdrawalHistoryPage = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem("accessToken")

  const [history, setHistory] = useState([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  // 잔액 포맷
  const formatNum = (n) => n.toLocaleString()

  // ⏰ KST(한국 시간) 변환
  const formatKST = (dateString) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
    })
  }

  useEffect(() => {
    loadHistory()
    loadBalance()
  }, [])

  const loadHistory = async () => {
    try {
      const res = await getWithdrawHistory()
      setHistory(res)
    } catch (err) {
      console.error("환전 내역 불러오기 실패:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadBalance = async () => {
    try {
      const res = await getMyPoint(token)
      setBalance(res.balance)
    } catch (err) {
      console.error("잔액 불러오기 실패:", err)
    }
  }

  if (loading) return <div className="loading">불러오는 중...</div>

  return (
    <div className="history-wrapper">
      <div className="history-card">

        {/* 헤더 */}
        <div className="history-header">
          <h2 className="history-title">환전 내역</h2>
          <div className="balance-box">
            <span className="balance-label">현재 잔액</span>
            <span className="balance-value">{formatNum(balance)} 얌</span>
          </div>
        </div>

        {/* 리스트 */}
        {history.length === 0 ? (
          <div className="empty-history">
            <p>환전 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((w) => (
              <div key={w.id} className="history-item">
                
                <div className="history-row">
                  <span className="label">금액</span>
                  <span className="value">-{formatNum(w.amount)} 얌</span>
                </div>

                <div className="history-row">
                  <span className="label">상태</span>
                  <span
                    className={`status ${
                      w.status === "COMPLETED"
                        ? "completed"
                        : w.status === "DENIED"
                        ? "denied"
                        : "requested"
                    }`}
                  >
                    {w.status}
                  </span>
                </div>

                {w.denyReason && (
                  <div className="history-row">
                    <span className="label">사유</span>
                    <span className="deny-reason">{w.denyReason}</span>
                  </div>
                )}

                <div className="history-row">
                  <span className="label">요청 일시</span>
                  <span className="value">{formatKST(w.createdAt)}</span>
                </div>

                <div className="history-row">
                  <span className="label">처리 일시</span>
                  <span className="value">{formatKST(w.updatedAt)}</span>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default WithdrawalHistoryPage
