import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getMyPoint } from "../api/pointAPI"
import { getTeamColors } from "../../sns/utils/teamColors"
import "../styles/MyPoint.css"

function MyPoint() {
  const [balance, setBalance] = useState(null)
  const [error, setError] = useState(null)
  const [amount, setAmount] = useState("")
  const token = localStorage.getItem("accessToken")
  const navigate = useNavigate()
  const [teamColors, setTeamColors] = useState(getTeamColors())

  useEffect(() => {
    setTeamColors(getTeamColors())
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getMyPoint(token)
        setBalance(res.balance)
      } catch (err) {
        setError("포인트를 불러오지 못했습니다.")
      }
    }
    fetchData()
  }, [token])

  const format = (num) => num.toLocaleString()

  // 안전한 숫자 입력 + 쉼표 적용
  const handleAmountInput = (e) => {
    let raw = e.target.value.replace(/[^\d]/g, "")

    if (raw === "") {
      setAmount("")
      return
    }

    // 최대 9자리 제한 (1억 미만)
    if (raw.length > 9) return

    setAmount(raw)
  }

  const addAmount = (value) => {
    setAmount((prev) => {
      const n = Number(prev || 0) + value
      return n.toString()
    })
  }

  if (error) return <p>{error}</p>
  if (balance === null) return <p>로딩 중...</p>

  return (
    <div className="mypoint-container">

      {/* 헤더 */}
      <div className="mypoint-header">
        <div className="mypoint-logo">얌페이 충전</div>
      </div>

      {/* 금액 입력 */}
      <div className="mypoint-section">
        <h3 className="mypoint-title">충전할 금액을 입력해 주세요.</h3>

        <input
          type="text"
          className="mypoint-input"
          inputMode="numeric"
          pattern="\d*"
          value={amount ? format(Number(amount)) : ""}
          placeholder="예: 10,000 얌"
          onChange={handleAmountInput}
        />

        <div className="mypoint-buttons">
          <button onClick={() => addAmount(10000)}>+1만</button>
          <button onClick={() => addAmount(50000)}>+5만</button>
          <button onClick={() => addAmount(100000)}>+10만</button>
          <button onClick={() => addAmount(500000)}>+50만</button>
        </div>
      </div>

      {/* 하단 */}
      <div className="mypoint-footer">
        <p className="mypoint-balance">현재 잔액: {format(balance)} 얌</p>

        <button
          className="mypoint-charge-btn"
          onClick={() =>
            navigate("/checkout", { state: { amount: Number(amount) } })
          }
          disabled={!amount || Number(amount) <= 0}
          style={{
            backgroundColor: teamColors.bgColor,
            color: teamColors.textColor,
          }}
        >
          {amount ? `${format(Number(amount))}얌 충전하기` : "충전하기"}
        </button>
      </div>

    </div>
  )
}

export default MyPoint
