import MatchDateSearch from "./components/MatchDateSearch";
import MatchList from "./components/MatchList";
import { useState } from "react";
import "./styles/match.css";

function MatchResultPage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);

  // 날짜 검색 실행
  const handleSearch = ({ date }) => {
    setSelectedDate(date);
    setSearchTriggered(true);
  };

  return (
    <div className="match-page-container">
      <h1 className="page-title">경기 결과 조회</h1>
      
      {/* 날짜 검색 */}
      <MatchDateSearch onSearch={handleSearch} />
      
      {/* 경기 목록 */}
      <MatchList 
        selectedDate={searchTriggered ? selectedDate : null} 
      />
    </div>
  );
}

export default MatchResultPage;