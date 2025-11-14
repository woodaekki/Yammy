import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getMyPoint } from "../../payment/api/pointAPI"
import "../styles/BankStatement.css"

function BankStatement() {
  const navigate = useNavigate()
  const token = localStorage.getItem("accessToken")
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  const format = (n) => n.toLocaleString()

  useEffect(() => {
    loadBalance()
  }, [])

  const loadBalance = async () => {
    try {
      const res = await getMyPoint(token)
      setBalance(res.balance)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bs-wrapper">
      <div className="bs-card">
        <h2 className="bs-title">야미 페이 메뉴</h2>

        {/* 잔액 박스 */}
        <div className="bs-balance-box">
          <span className="bs-balance-label">현재 잔액</span>
          <span className="bs-balance-value">{format(balance)} 얌</span>
        </div>

        <button
          className="bs-btn"
          onClick={() => navigate("/mypoint")}
        >
          충전하기
        </button>

        <button
          className="bs-btn"
          onClick={() => navigate("/withdraw")}
        >
          환전하기
        </button>

        <button
          className="bs-btn"
          onClick={() => navigate("/withdraw/history")}
        >
          환전 내역
        </button>
      </div>
    </div>
  )
}

export default BankStatement
