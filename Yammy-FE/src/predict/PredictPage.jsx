import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePredict } from './hooks/usePredict';
import { TEAM_COLORS } from '../sns/utils/teamColors';
import './styles/predict.css';

const PredictPage = () => {
  const navigate = useNavigate();
  
  // 오늘 날짜 가져오기
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 0부터 시작하므로 +1
  const day = today.getDate();

  // 오늘 날짜 문자열 생성 (YYYY-MM-DD 형식)
  const todayDateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  // 경기 데이터 가져오기
  const { matches, loading, error } = usePredict();

  // 오늘 경기만 필터링
  const todayMatches = matches.filter(match => match.date === todayDateString);

  // 팀 컬러 가져오기 함수
  const getTeamColor = (teamName) => {
    return TEAM_COLORS[teamName]?.bgColor || '#4CAF50';
  };

  // 경기 진행 여부 확인 함수
  const isGameInProgress = (gameTime) => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // 경기 시간 파싱 (예: "18:30")
    const [gameHours, gameMinutes] = gameTime.split(':').map(Number);
    
    // 현재 시간을 분으로 변환
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
    const gameTimeInMinutes = gameHours * 60 + gameMinutes;
    
    // 경기 시간이 현재 시간보다 빠르면 진행중
    return currentTimeInMinutes > gameTimeInMinutes-1;
  };

  // 경기 클릭 핸들러
  const handleMatchClick = (matchId) => {
    navigate(`/prediction/${matchId}`);
  };

  return (
    <div className="predict-page">
      <div className="predict-header">
        <h1>⚾ 승부 예측</h1>
        <p>오늘의 KBO 경기에 대한 승부를 예측해보세요!</p>
      </div>
      
      <div className="predict-schedule">
        <h2>{year}년 {month}월 {day}일</h2>
      </div>
      
      <div className="predict-content">
        <div className="today-matches">
          <h2>오늘의 경기</h2>
          
          {loading && (
            <div className="loading">경기 데이터를 불러오는 중...</div>
          )}
          
          {error && (
            <div className="error">{error}</div>
          )}
          
          {!loading && !error && todayMatches.length > 0 && (
            <div className="matches-list">
              {todayMatches.map((match) => {
                const gameInProgress = isGameInProgress(match.gameTime);
                
                return (
                  <div 
                    key={match.id} 
                    className={`match-card-container ${gameInProgress ? 'game-in-progress' : ''}`}
                    onClick={() => handleMatchClick(match.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="match-time-header">{match.gameTime}</div>
                    <div className="match-prediction-card">
                      {/* 홈팀 */}
                      <div 
                        className="team-section home-team-section"
                        style={{ backgroundColor: getTeamColor(match.homeTeam) }}
                      >
                        <div className="team-label">HOME</div>
                        <div className="team-name">{match.homeTeam} ({match.homeWinningRate}%)</div>
                        <div className="prediction-score">50%</div>
                      </div>
                      
                      {/* 중앙 VS */}
                      <div className="vs-section">
                        <span className="vs-text">VS</span>
                      </div>
                      
                      {/* 원정팀 */}
                      <div 
                        className="team-section away-team-section"
                        style={{ backgroundColor: getTeamColor(match.awayTeam) }}
                      >
                        <div className="team-label">AWAY</div>
                        <div className="team-name">{match.awayTeam} ({match.awayWinningRate}%)</div>
                        <div className="prediction-score">50%</div>
                      </div>
                    </div>
                    <div className="match-stadium">{match.stadium}</div>
                    
                    {/* 경기 진행중 오버레이 */}
                    {gameInProgress && (
                      <div className="game-progress-overlay">
                        <div className="progress-message">경기가 이미 진행중입니다</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {!loading && !error && todayMatches.length === 0 && (
            <div className="no-matches">오늘 예정된 경기가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictPage;
