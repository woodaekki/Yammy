import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getWithdrawHistory } from "../withdrawal/api/withdrawalApi"
import { getMyPoint } from "../payment/api/pointAPI"
import "./styles/WithdrawalHistoryPage.css"

const WithdrawalHistoryPage = () => {
  const token = localStorage.getItem("accessToken")
  const navigate = useNavigate()

  const [history, setHistory] = useState([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  const formatNum = (n) => n.toLocaleString()

  const formatKST = (d) => {
    if (!d) return "-"
    return new Date(d).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
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

  return (
    <div className="history-wrapper">

      {/* 상단 잔액 카드 */}
      <div className="history-balance-card">
        <div className="balance-title-row">
          <h2 className="history-title">환전 내역</h2>
          <button
            className="back-statement-btn"
            onClick={() => navigate("/bankstatement")}
          >
            페이 홈 →
          </button>
        </div>

        <div className="balance-card-box">
          <span className="balance-label">현재 잔액</span>
          <span className="balance-value">{formatNum(balance)} 얌</span>
        </div>
      </div>

      {/* 리스트 */}
      <div className="history-list-card">

        {loading ? (
          <div className="loading">불러오는 중...</div>
        ) : history.length === 0 ? (
          <div className="empty-history">
            환전 내역이 없습니다.
          </div>
        ) : (
          <div className="history-list">
            {history.map((w) => (
              <div key={w.id} className="history-item">

                <div className="history-item-top">
                  <span className="history-amount">-{formatNum(w.amount)} 얌</span>

                  <span
                    className={`status-pill ${
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
                  <div className="history-reason">사유: {w.denyReason}</div>
                )}

                <div className="history-item-bottom">
                  <span className="history-date">
                    요청: {formatKST(w.createdAt)}
                  </span>
                  <span className="history-date">
                    처리: {formatKST(w.updatedAt)}
                  </span>
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
