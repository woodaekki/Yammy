import { useNavigate } from "react-router-dom";
import { useMatch } from "../hooks/useMatch";
import { useEffect } from "react";
import "../styles/match.css";

function MatchList({ selectedDate }) {
  const navigate = useNavigate();
  const { 
    matches, 
    loading, 
    error, 
    searchMatchesByDate 
  } = useMatch();

  // 경기 상세 페이지로 이동
  function goToDetail(matchcode) {
    navigate(`/match/${matchcode}`);
  }

  useEffect(() => {
    if (selectedDate) {
      searchMatchesByDate(selectedDate);
    }
  }, [selectedDate, searchMatchesByDate]);

  // 날짜가 선택되지 않았으면 빈 화면
  if (!selectedDate) {
    return (
      <div className="no-matches">
        <p>📅 날짜를 선택하여 경기를 조회해주세요.</p>
      </div>
    );
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">⚾</div>
        <p>경기 정보를 불러오는 중...</p>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>❌ 오류 발생</h3>
          <p>{error}</p>
          <button 
            onClick={() => searchMatchesByDate(selectedDate)}
            className="retry-btn"
          >
            🔄 다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!matches || matches.length === 0) {
    return (
      <div className="no-matches">
        <h3>📭 {selectedDate}에 경기가 없습니다.</h3>
        <p>다른 날짜를 선택해보세요.</p>
      </div>
    );
  }

  // 실제 API 데이터 표시
  return (
    <div className="match-list-container">
      <div className="match-list-header">
        <h3>📅 {selectedDate} 경기 목록 ({matches.length}경기)</h3>
      </div>
      
      <div className="match-cards">
        {matches.map((match) => (
          <div 
            key={match.matchcode} 
            className="match-card" 
            onClick={() => goToDetail(match.matchcode)}
          >
            <div className="match-teams-vs">
              <div className="team-section">
                <span className={`team-name ${match.team1.result === 1 ? 'winner' : 'loser'}`}>
                  {match.team1.name}
                </span>
                <span className={`team-result ${match.team1.result === 1 ? 'win' : 'lose'}`}>
                  {match.team1.result === 1 ? '승' : '패'}
                </span>
              </div>
              
              <div className="score-vs-section">
                <span className="team-score">{match.team1.run}</span>
                <span className="vs-divider">:</span>
                <span className="team-score">{match.team2.run}</span>
              </div>
              
              <div className="team-section">
                <span className={`team-name ${match.team2.result === 1 ? 'winner' : 'loser'}`}>
                  {match.team2.name}
                </span>
                <span className={`team-result ${match.team2.result === 1 ? 'win' : 'lose'}`}>
                  {match.team2.result === 1 ? '승' : '패'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatchList;
