import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("결제 확인 중...");
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    async function confirmPayment() {
      try {
        const paymentKey = searchParams.get("paymentKey");
        const orderId = searchParams.get("orderId");
        const amount = searchParams.get("amount");

        // 백엔드로 결제 승인 요청 보내기
        const res = await axios.post(
          "http://localhost:8080/api/payments/confirm",
          { paymentKey, orderId, amount },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("결제 승인 완료:", res.data);
        setMessage(`결제가 완료되었습니다! 충전 금액: ${amount}원`);
      } catch (err) {
        console.error(err);
        setMessage("결제 승인에 실패했습니다.");
      }
    }

    confirmPayment();
  }, []);

  return (
    <div>
      <h2>결제 결과</h2>
      <p>{message}</p>
    </div>
  );
}
