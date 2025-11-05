import { useState } from "react";
import "../styles/match.css";

function MatchDateSearch({ onSearch }) {
  const [selectedDate, setSelectedDate] = useState("");

  // 검색 버튼 클릭 시
  function handleSearch(e) {
    e.preventDefault();
    if (!selectedDate) {
      alert("날짜를 선택해주세요.");
      return;
    }
    onSearch({ date: selectedDate });
  }

  // 오늘 날짜로 설정
  function setToday() {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }


  return (
    <div className="match-date-search-container">
      <h2 className="search-title">경기 일정 조회</h2>
      
      <form className="date-search-form" onSubmit={handleSearch}>
        <div className="date-input-section">
          <label htmlFor="match-date" className="date-label">
            경기 날짜:
          </label>
          <input
            id="match-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
            max={new Date().toISOString().split('T')[0]} // 미래 날짜 선택 방지
          />
        </div>

        <div className="quick-date-buttons">
          <button type="button" onClick={setToday} className="quick-btn">
            오늘
          </button>
        </div>

        <button type="submit" className="search-btn">
          경기 조회
        </button>
      </form>
    </div>
  );
}

export default MatchDateSearch;