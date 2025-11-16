import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { requestWithdraw } from "../withdrawal/api/withdrawalApi"
import "./styles/WithdrawalPage.css"

const WithdrawalPage = () => {
  const navigate = useNavigate()

  const [amount, setAmount] = useState("")
  const [bankName, setBankName] = useState("선택")
  const [accountNumber, setAccountNumber] = useState("")
  const [error, setError] = useState("")

  const rules = {
    "카카오뱅크": { prefix: "3333", length: 13 },
    "토스뱅크": { prefix: "1000", length: 12 },
    "국민은행": { prefix: "", length: 12 },
    "신한은행": { prefix: "110", length: 9 },
    "기업은행": { prefix: "", length: 14 },
    "농협은행": { prefix: "", length: 13 },
    "우리은행": { prefix: "", length: 11 },
    "하나은행": { prefix: "", length: 12 }
  }

  const handleAccountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "")
    setAccountNumber(raw)

    if (bankName === "선택") {
      setError("은행을 선택하세요.")
      return
    }

    const { prefix, length } = rules[bankName]

    if (prefix && !raw.startsWith(prefix)) {
      setError("존재하지 않는 계좌번호입니다.")
      return
    }

    if (raw.length > length) {
      setError("존재하지 않는 계좌번호입니다.")
      return
    }

    if (raw.length === length) {
      setError("")
    } else {
      setError("존재하지 않는 계좌번호입니다.")
    }
  }

  const isValid =
    amount &&
    bankName !== "선택" &&
    error === "" &&
    accountNumber.length === (rules[bankName]?.length || 0)

  const handleSubmit = async () => {
    if (!isValid) return

    try {
      const dto = {
        amount: Number(amount),
        bankName,
        accountNumber
      }

      await requestWithdraw(dto)
      window.dispatchEvent(new Event("pointUpdated"))

      setAmount("")
      setBankName("선택")
      setAccountNumber("")
      setError("")

      alert("환전이 완료되었습니다.")
    } catch (err) {
      alert(err?.response?.data?.message || "환전 요청 실패")
    }
  }

  return (
    <div className="withdraw-wrapper">

      <div className="withdraw-header-row">
        <h2 className="withdraw-title">환전하기</h2>
        <button
          className="withdraw-history-btn"
          onClick={() => navigate("/withdraw/history")}
        >
          내역 보기
        </button>
      </div>

      <div className="withdraw-card">

        <div className="withdraw-field">
          <label>환전 금액</label>

          {/* 숫자 키패드 + 숫자만 입력 */}
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            value={amount}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d]/g, "")
              if (raw.length > 9) return
              setAmount(raw)
            }}
            placeholder="예: 10,000"
            className="withdraw-input"
          />
        </div>

        <div className="withdraw-field">
          <label>은행 선택</label>
          <select
            value={bankName}
            onChange={(e) => {
              setBankName(e.target.value)
              setAccountNumber("")
              setError("")
            }}
            className="custom-select"
          >
            <option value="선택">은행을 선택하세요</option>
            <option>카카오뱅크</option>
            <option>토스뱅크</option>
            <option>국민은행</option>
            <option>신한은행</option>
            <option>기업은행</option>
            <option>농협은행</option>
            <option>우리은행</option>
            <option>하나은행</option>
          </select>
        </div>

        <div className="withdraw-field">
          <label>계좌번호</label>

          {/* 숫자 키패드 + 숫자만 입력 */}
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            value={accountNumber}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d]/g, "")
              handleAccountChange({ target: { value: raw } })
            }}
            className={`withdraw-input ${accountNumber && error ? "input-error" : ""}`}
          />

          {accountNumber && error && (
            <div className="error-text">{error}</div>
          )}
        </div>

        <button
          className={`withdraw-submit-btn ${isValid ? "active" : "disabled"}`}
          disabled={!isValid}
          onClick={handleSubmit}
        >
          환전하기
        </button>

      </div>
    </div>
  )
}

export default WithdrawalPage
