import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { requestWithdraw } from "../withdrawal/api/withdrawalApi"
import "./styles/WithdrawalPage.css"

const WithdrawalPage = () => {
  const navigate = useNavigate()
  const [amount, setAmount] = useState("")
  const [bankName, setBankName] = useState("선택")
  const [accountNumber, setAccountNumber] = useState("")
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  // 은행별 앞번호 + 구간 규칙
  const rules = {
    "카카오뱅크": { prefix: "3333", segments: [4, 2, 7] },
    "토스뱅크":    { prefix: "1000", segments: [4, 4] },
    "국민은행":    { prefix: null,  segments: [3, 2, 7] },
    "신한은행":    { prefix: "110", segments: [3, 6] },
    "기업은행":    { prefix: null,  segments: [3, 6, 2, 3] },
    "농협은행":    { prefix: null,  segments: [3, 4, 4, 2] },
    "우리은행":    { prefix: null,  segments: [3, 6, 2] },
    "하나은행":    { prefix: null,  segments: [3, 6, 3] }
  }

  // 세그먼트 검사
  const validateBySegments = (value, segments) => {
    let idx = 0
    for (let len of segments) {
      const part = value.slice(idx, idx + len)
      if (part.length !== len) return false
      idx += len
    }
    return true
  }

  // 계좌번호 입력 핸들러
  const handleAccountChange = (e) => {
    const nums = e.target.value.replace(/\D/g, "")
    setAccountNumber(nums)

    if (bankName === "선택") {
      setError("존재하지 않는 계좌번호입니다.")
      return
    }

    const { prefix, segments } = rules[bankName]
    const requiredLength = segments.reduce((a, b) => a + b, 0)

    if (!nums.length) {
      setError("")
      return
    }

    if (prefix && !nums.startsWith(prefix)) {
      setError("존재하지 않는 계좌번호입니다.")
      return
    }

    if (nums.length !== requiredLength) {
      setError("존재하지 않는 계좌번호입니다.")
      return
    }

    if (!validateBySegments(nums, segments)) {
      setError("존재하지 않는 계좌번호입니다.")
      return
    }

    setError("")
  }

  // 활성화 조건 계산
  const isValid =
    amount &&
    bankName !== "선택" &&
    accountNumber &&
    !error

  const handleSubmit = async () => {
    if (!isValid) return

    const { prefix, segments } = rules[bankName]
    const requiredLength = segments.reduce((a, b) => a + b, 0)

    if (
      (prefix && !accountNumber.startsWith(prefix)) ||
      accountNumber.length !== requiredLength ||
      !validateBySegments(accountNumber, segments)
    ) {
      alert("존재하지 않는 계좌번호입니다.")
      return
    }

    try {
      const dto = { amount: Number(amount), bankName, accountNumber }
      const res = await requestWithdraw(dto)
      setResult(res)
      alert("환전 요청 완료!")
    } catch (err) {
      alert(err?.response?.data?.message || "환전 요청 실패")
    }
  }

  return (
    <div className="withdraw-wrapper">
      <div className="withdraw-card">
         <h2 className="withdraw-title">환전하기</h2>

        <div className="statement-container">
          <button
            className="statement-btn"
            onClick={() => navigate("/bankstatement")}
          >
            얌 포인트 내역
          </button>
        </div>

        <div className="withdraw-field">
          <label>환전 금액</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
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
          <input
            type="text"
            value={accountNumber}
            onChange={handleAccountChange}
            className={`withdraw-input ${error ? "input-error" : accountNumber ? "input-valid" : ""}`}
            placeholder="숫자만 입력"
          />
          {error && <div className="error-text">{error}</div>}
        </div>

        {/* 활성화/비활성 버튼 스타일 변경 */}
        <button
          className={`withdraw-submit-btn ${isValid ? "active" : "disabled"}`}
          onClick={handleSubmit}
          disabled={!isValid}
        >
          환전 요청
        </button>

        {result && (
          <div className="withdraw-result">
            <p>상태: {result.status}</p>
            <p>은행: {result.bankName}</p>
            <p>계좌: {result.accountNumber}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WithdrawalPage
