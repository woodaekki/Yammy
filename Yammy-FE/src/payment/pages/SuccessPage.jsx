import { useSearchParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { confirmTossPayment } from "../api/tossApi"
import "../styles/SuccessPage.css"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function SuccessPage() {
  const [searchParams] = useSearchParams()
  const [message, setMessage] = useState("결제 확인 중입니다...")
  const [isSuccess, setIsSuccess] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey")
    const orderId = searchParams.get("orderId")
    const amount = searchParams.get("amount")

    const confirmPayment = async () => {
      try {
        const response = await confirmTossPayment({
          paymentKey,
          orderId,
          amount,
        })

        // console.log("결제 승인 완료:", response)
        setIsSuccess(true)
        setMessage(`결제가 완료되었습니다. 충전 금액: ${Number(amount).toLocaleString()}얌`)
        
        // 포인트 충전 자동 갱신
        window.dispatchEvent(new Event("pointUpdated"))
      } catch (error) {
        console.error("결제 승인 실패:", error)
        setIsSuccess(false)
        setMessage("결제 승인에 실패했습니다. 다시 시도해주세요.")
      }
    }

    confirmPayment()
  }, [searchParams])

  return (
    <div className="payment-result-container">
      <div className="payment-card">
        {/* 아이콘 */}
        <div className={`payment-icon ${isSuccess ? "success" : "fail"}`}>
          {isSuccess === null ? "..." : isSuccess ? "✓" : "✕"}
        </div>

        {/* 결과 문구 */}
        <h2 className="payment-title">
          {isSuccess === null
            ? "결제 확인 중입니다"
            : isSuccess
            ? "결제가 완료되었습니다"
            : "결제 실패"}
        </h2>

        <p className="payment-message">{message}</p>

        {/* 버튼 */}
        <div className="payment-buttons">
          <button className="payment-btn" onClick={() => navigate("/useditem")}>
            홈으로 가기
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuccessPage
