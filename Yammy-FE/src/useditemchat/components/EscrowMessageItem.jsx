import { useState } from "react";
import { confirmed } from "../../payment/api/escrowApi";
import "../styles/EscrowMessage.css";

function EscrowMessageItem({ message, isMine }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const myId = localStorage.getItem("memberId");
  const format = (num) => num.toLocaleString();

  // 상태 문자열 처리 (Firebase or DB 구분 없이)
  const isCompleted =
    message.status === "completed" || message.status === "RELEASED";
  const isPending =
    message.status === "pending" || message.status === "HOLD";
  const isCancelled =
    message.status === "cancelled" || message.status === "CANCELLED";

  const handleConfirm = async () => {
    if (isProcessing) return;
    if (!window.confirm("송금을 받으시겠습니까?")) return;

    setIsProcessing(true);
    try {
      await confirmed(message.escrowId);
      alert("송금을 받았습니다!");
      window.dispatchEvent(new Event("pointUpdated"));
      // Firebase 실시간 반영되므로 reload 불필요
    } catch (error) {
      console.error("송금 받기 실패:", error);
      alert(error.response?.data?.message || "송금 받기에 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 🔹 내가 보낸 사람이면 → “송금했습니다” / 상대가 받는 중
  // 🔹 내가 아닌 사람이면 → “송금이 도착했습니다” / 내가 받기 버튼 클릭 대상
  const isReceiver = !isMine; // 판매자에게만 “받기” 버튼 보이게
  const roleLabel = isMine ? "송금했습니다" : "송금이 도착했습니다";

  return (
    <div className={`escrow-message-item ${isMine ? "mine" : "other"}`}>
      <div className="escrow-message-card">
        <div className="escrow-message-icon">💰</div>
        <div className="escrow-message-content">
          <div className="escrow-message-header">
            <span className="escrow-message-label">{roleLabel}</span>
            <span
              className={`escrow-message-status ${
                isCompleted
                  ? "completed"
                  : isCancelled
                  ? "cancelled"
                  : "pending"
              }`}
            >
              {isCompleted
                ? "완료"
                : isCancelled
                ? "취소됨"
                : "대기중"}
            </span>
          </div>

          <div className="escrow-message-amount">
            {format(message.amount)} 얌
          </div>

          {/* 판매자만, 대기중일 때 버튼 노출 */}
          {isReceiver && isPending && (
            <button
              className="escrow-message-receive-btn"
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? "처리중..." : "받기"}
            </button>
          )}

          {message.createdAt && (
            <div className="escrow-message-time">
              {new Date(message.createdAt.seconds * 1000).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EscrowMessageItem;
