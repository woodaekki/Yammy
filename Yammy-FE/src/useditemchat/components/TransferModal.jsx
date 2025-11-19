import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "../styles/TransferModal.css";

function TransferModal({ isOpen, onClose, onSubmit, currentBalance }) {
  const [amount, setAmount] = useState(0);

  const addAmount = (value) => setAmount((prev) => prev + value);
  const format = (num) => num.toLocaleString();

  // === 모달 열릴 때 body 스크롤 잠금 ===
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="transfer-modal-overlay" onClick={onClose}>
      <div
        className="transfer-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="transfer-modal-header">
          <h2 className="transfer-modal-title">송금하기</h2>
          <button className="transfer-modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 금액 입력 */}
        <div className="transfer-modal-body">
          <h3 className="transfer-modal-subtitle">송금할 금액을 입력해 주세요.</h3>

          <input
            type="text"
            className="transfer-modal-input"
            value={amount ? format(amount) : ""}
            placeholder="금액을 입력하세요."
            onChange={(e) => {
              const v = e.target.value.replace(/,/g, "");
              if (!isNaN(v)) setAmount(Number(v));
            }}
          />

          <div className="transfer-modal-buttons">
            <button onClick={() => addAmount(10000)}>+1만</button>
            <button onClick={() => addAmount(50000)}>+5만</button>
            <button onClick={() => addAmount(100000)}>+10만</button>
            <button onClick={() => addAmount(500000)}>+50만</button>
          </div>
        </div>

        {/* 하단 */}
        <div className="transfer-modal-footer">
          <p className="transfer-modal-balance">
            현재 잔액: {format(currentBalance)} 얌
          </p>
          <button
            className="transfer-modal-submit-btn"
            onClick={() => {
              if (amount <= 0) return alert("송금 금액을 입력해주세요.");
              if (amount > currentBalance) return alert("잔액이 부족합니다.");

              onSubmit(amount);
              setAmount(0);
              onClose();
            }}
            disabled={amount <= 0 || amount > currentBalance}
          >
            {format(amount)}얌 송금하기
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default TransferModal;
