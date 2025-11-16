import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getMyPoint } from "../../payment/api/pointAPI"
import { FiChevronRight, FiCreditCard, FiUpload, FiFileText } from "react-icons/fi"
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

      {/* 잔액 카드 */}
      <div className="bs-balance-card">
        <span className="bs-balance-label">현재 잔액</span>
        <span className="bs-balance-value">
          {format(balance)} 얌
        </span>
      </div>

      {/* 메뉴 카드 */}
      <div className="bs-menu-card">

        {/* 충전하기 */}
        <div className="bs-menu-item" onClick={() => navigate("/mypoint")}>
          <div className="bs-menu-left">
            <FiCreditCard className="bs-menu-icon" />
            <span className="bs-menu-text">충전하기</span>
          </div>
          <FiChevronRight className="bs-menu-arrow" />
        </div>

        {/* 환전하기 */}
        <div className="bs-menu-item" onClick={() => navigate("/withdraw")}>
          <div className="bs-menu-left">
            <FiUpload className="bs-menu-icon" />
            <span className="bs-menu-text">환전하기</span>
          </div>
          <FiChevronRight className="bs-menu-arrow" />
        </div>

        {/* 거래 내역 */}
        <div className="bs-menu-item" onClick={() => navigate("/withdraw/history")}>
          <div className="bs-menu-left">
            <FiFileText className="bs-menu-icon" />
            <span className="bs-menu-text">환전 내역</span>
          </div>
          <FiChevronRight className="bs-menu-arrow" />
        </div>

      </div>
    </div>
  )
}

export default BankStatement
