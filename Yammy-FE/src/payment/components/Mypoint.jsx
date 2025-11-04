import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getMyPoint } from "../api/pointAPI"

function MyPoint() {
  const [balance, setBalance] = useState(null)
  const [error, setError] = useState(null)
  const token = localStorage.getItem("accessToken")
  const navigate = useNavigate()

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

  if (error) return <p>{error}</p>
  if (balance === null) return <p>로딩 중...</p>

  return (
    <div>
      <h2>내 포인트</h2>
      <p>{balance.toLocaleString()} 얌</p>

      <button onClick={() => navigate("/checkout")}>
        충전하기
      </button>
    </div>
  )
}

export default MyPoint
