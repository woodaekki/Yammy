import { useState } from "react"
import { requestWithdraw } from "../withdrawal/api/withdrawalApi"
import "./styles/WithdrawalPage.css"

const WithdrawalPage = () => {
  const [amount, setAmount] = useState("")
  const [bankName, setBankName] = useState("국민은행")
  const [accountNumber, setAccountNumber] = useState("")
  const [result, setResult] = useState(null)

  const handleSubmit = async () => {
    if (!amount || !accountNumber) {
      alert("금액과 계좌번호를 입력하세요.")
      return
    }

    try {
      const dto = {
        amount: Number(amount),
        bankName,
        accountNumber
      }

      const res = await requestWithdraw(dto)
      setResult(res)
      alert("환전 요청 완료!")
    } catch (err) {
      console.error(err)
      alert("환전 요청 실패")
    }
  }

  return (
    <div className="withdraw-container">
      <h2>환전하기</h2>

      <label>환전 금액</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="예: 10000"
      />

      <label>은행 선택</label>
      <select value={bankName} onChange={(e) => setBankName(e.target.value)}>
        <option>국민은행</option>
        <option>신한은행</option>
        <option>우리은행</option>
        <option>하나은행</option>
        <option>농협은행</option>
      </select>

      <label>계좌번호</label>
      <input
        type="text"
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
      />

      <button className="withdraw-btn" onClick={handleSubmit}>
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
  )
}

export default WithdrawalPage
