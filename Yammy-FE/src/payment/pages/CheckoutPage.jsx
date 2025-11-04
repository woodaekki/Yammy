import { useEffect, useState } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const customerKey = "yammy-user";

export default function CheckoutPage() {
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState(null);
  const [amount, setAmount] = useState({ currency: "KRW", value: 5000 });

  useEffect(() => {
    async function initWidgets() {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const widgets = tossPayments.widgets({ customerKey });
        await widgets.setAmount(amount);

        await Promise.all([
          widgets.renderPaymentMethods({
            selector: "#payment-method",
            variantKey: "DEFAULT",
          }),
          widgets.renderAgreement({
            selector: "#agreement",
            variantKey: "AGREEMENT",
          }),
        ]);

        setWidgets(widgets);
        setReady(true);
      } catch (err) {
        console.error("Toss 위젯 로드 실패:", err);
      }
    }

    initWidgets();
  }, []);

  async function handlePayment() {
    if (!widgets) return;
    try {
      const orderId = "order-" + new Date().getTime();
      await widgets.requestPayment({
        orderId,
        orderName: "얌 포인트 충전",
        successUrl: window.location.origin + "/success",
        failUrl: window.location.origin + "/fail",
      });
    } catch (err) {
      console.error("결제 실패:", err);
    }
  }

  return (
    <div>
      <h2>얌 포인트 충전</h2>

      <div id="payment-method"></div>
      <div id="agreement"></div>

      <div>
        <input
          type="number"
          value={amount.value}
          onChange={(e) =>
            setAmount({ currency: "KRW", value: Number(e.target.value) })
          }
        />
      </div>

      <button
        onClick={handlePayment}
        disabled={!ready}
      >
        결제하기
      </button>
    </div>
  );
}
