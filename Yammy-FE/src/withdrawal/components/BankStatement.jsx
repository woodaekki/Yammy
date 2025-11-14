import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getMyPoint } from "../../payment/api/pointAPI"

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

  if (loading) return <div>불러오는 중...</div>

  return (
    <div>
      <h2>얌페이 메뉴</h2>

      <div>
        <span>현재 잔액</span>
        <span>{format(balance)} 얌</span>
      </div>

      <button onClick={() => navigate("/mypoint")}>
        충전하기
      </button>

      <button onClick={() => navigate("/withdraw")}>
        환전하기
      </button>

      <button onClick={() => navigate("/withdraw/history")}>
        환전 내역
      </button>
    </div>
  )
}

export default BankStatement
