import { useState } from "react";
import "../styles/match.css";

function MatchSearch({ onSearch }) {
  const [selectedDate, setSelectedDate] = useState("");

  // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기
  const today = new Date().toISOString().split('T')[0];

  // 검색 버튼 클릭 or Enter 입력 시 호출
  function handleSearch(e) {
    e.preventDefault();
    if (!selectedDate) {
      alert("날짜를 선택해주세요.");
      return;
    }
    onSearch({ date: selectedDate });
  }

  return (
    <form className="match-search-container" onSubmit={handleSearch}>
      <div className="search-content">
        <div className="date-input-group">
          <label htmlFor="match-date" className="date-label">
            경기 날짜
          </label>
          <input
            id="match-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={today}
            className="date-input"
          />
        </div>

        <button type="submit" className="search-btn">
          경기 조회
        </button>
      </div>
    </form>
  );
}

export default MatchSearch;