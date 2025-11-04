import { useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"

function SuccessPage() {
  const [searchParams] = useSearchParams()
  const [message, setMessage] = useState("결제 확인 중입니다...")
  const token = localStorage.getItem("accessToken")

  useEffect(() => {
    // URL에서 결제 정보 꺼내기
    const paymentKey = searchParams.get("paymentKey")
    const orderId = searchParams.get("orderId")
    const amount = searchParams.get("amount")

    // 결제 승인 요청 보내기
    axios
      .post(
        "http://localhost:8080/api/payments/confirm",
        { paymentKey, orderId, amount },
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json"
          }
        }
      )
      .then((res) => {
        console.log("결제 승인 완료:", res.data)
        setMessage("결제가 완료되었습니다. 충전 금액: " + amount + "원")
      })
      .catch((err) => {
        console.error("결제 승인 실패:", err)
        setMessage("결제 승인에 실패했습니다. 다시 시도해주세요.")
      })
  }, [])

  return (
    <div>
      <h2>결제 결과</h2>
      <p>{message}</p>
    </div>
  )
}
export default SuccessPage