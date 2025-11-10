import { useState } from "react";
import "../styles/TransferModal.css";

function TransferModal({ isOpen, onClose, onSubmit, currentBalance }) {
  const [amount, setAmount] = useState(0);

  const addAmount = (value) => setAmount((prev) => prev + value);
  const format = (num) => num.toLocaleString();

  const handleSubmit = () => {
    if (amount <= 0) {
      alert("송금 금액을 입력해주세요.");
      return;
    }
    if (amount > currentBalance) {
      alert("잔액이 부족합니다.");
      return;
    }
    onSubmit(amount);
    setAmount(0);
    onClose();
  };

  const handleClose = () => {
    setAmount(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="transfer-modal-overlay" onClick={handleClose}>
      <div className="transfer-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="transfer-modal-header">
          <h2 className="transfer-modal-title">송금하기</h2>
          <button className="transfer-modal-close-btn" onClick={handleClose}>
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
              const value = e.target.value.replace(/,/g, "");
              if (!isNaN(value)) setAmount(Number(value));
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
          <p className="transfer-modal-balance">현재 잔액: {format(currentBalance)} 얌</p>
          <button
            className="transfer-modal-submit-btn"
            onClick={handleSubmit}
            disabled={amount <= 0 || amount > currentBalance}
          >
            {format(amount)}얌 송금하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransferModal;