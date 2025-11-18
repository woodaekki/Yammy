import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { loadTossPayments } from "@tosspayments/tosspayments-sdk"
import { getTeamColors } from "../../sns/utils/teamColors" 
import "../styles/CheckoutPage.css"

const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY
const customerKey = import.meta.env.VITE_TOSS_CUSTOMER_KEY

function CheckoutPage() {
  const location = useLocation()
  const initialAmount = location.state?.amount || 0
  const [ready, setReady] = useState(false)
  const [amount] = useState(initialAmount)   
  const [widgets, setWidgets] = useState(null)
  const [teamColors, setTeamColors] = useState(getTeamColors())

  useEffect(() => {
    setTeamColors(getTeamColors())
  }, [])

  // 페이지가 처음 열리면 toss 결제 위젯 불러오기
  useEffect(() => {
    async function startToss() {
      try {
        // 토스 페이먼츠 화면 불러오기
        const tossPayments = await loadTossPayments(clientKey)
        const widget = tossPayments.widgets({ customerKey })

        //  MyPoint에서 넘겨받은 결제금액 표시하기
        await widget.setAmount({ currency: "KRW", value: amount })

        // 결제 수단 + 약관 UI 화면에 표시
        // 토스 페이먼츠 UI는 selector + id 조합으로 화면 클래스명을 지정 요구 
        await widget.renderPaymentMethods({ selector: "#payment-box" })
        await widget.renderAgreement({ selector: "#agreement-box" })

        setWidgets(widget)
        setReady(true)
      } catch (error) {
        console.error("토스 결제 위젯 불러오기 실패", error)
      }
    }

    startToss()
  }, [amount])

  // 결제하기 버튼 눌렀을 때 실행
  async function handlePayment() {
    if (!widgets) return
    try {
      const orderId = "order-" + new Date().getTime()

      await widgets.requestPayment({
        orderId,
        orderName: "얌 포인트 충전",
        successUrl: window.location.origin + "/success",
        failUrl: window.location.origin + "/fail"
      })
    } catch (error) {
      console.error("결제 요청 실패", error)
    }
  }

  return (
    <div style={{ padding: "20px" }}>

      {/* 테스트 환경 경고 안내 */}
      <div className="warning-strong">
        <div className="warning-strong-icon">ⓘ</div>

        <div className="warning-strong-msg">
          <div className="warning-strong-title">
            일부 결제수단은 테스트 환경에서 사용할 수 없습니다.
          </div>

          <div className="warning-strong-line">
            실시간 계좌이체 · 페이코 · 휴대폰 결제는 사용 불가합니다.
          </div>
        </div>
      </div>

      {/* 결제 UI */}
      <div id="payment-box" style={{ marginTop: "20px" }}></div>
      <div id="agreement-box" style={{ marginTop: "10px" }}></div>

      {/* 결제 버튼 */}
      <button
        onClick={handlePayment}
        disabled={!ready}
        style={{
          marginTop: "10px",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "8px",
          fontWeight: "600",
          cursor: ready ? "pointer" : "not-allowed",
          backgroundColor: teamColors.bgColor
        }}
      >
        결제하기
      </button>
    </div>
  )
}

export default CheckoutPage
