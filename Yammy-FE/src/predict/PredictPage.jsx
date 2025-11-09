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

  // 오늘 날짜 문자열 생성 (YYYYMMDD 형식으로 백엔드 데이터와 맞춤)
  const todayDateString = `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;

  // 경기 데이터 가져오기
  const { matches, loading, error } = usePredict();

  // 오늘 경기만 필터링 (날짜 형식 맞춤)
  const todayMatches = matches.filter(match => match.date === todayDateString);

  console.log('🎯 오늘 날짜:', todayDateString);
  console.log('🎯 전체 경기:', matches);
  console.log('🎯 오늘 경기:', todayMatches);

  // 팀 컬러 가져오기 함수 (짧은 이름 → 전체 이름 매핑)
  // 사용자 팀 컬러 가져오기
  const userTeam = localStorage.getItem('team') || 'LG 트윈스';
  const userTeamColor = TEAM_COLORS[userTeam]?.bgColor || '#4CAF50';
  const userTeamTextColor = TEAM_COLORS[userTeam]?.textColor || '#ffffff';

  // 팀 컬러 가져오기 함수
  const getTeamColor = (teamName) => {
    // 짧은 팀 이름을 전체 팀 이름으로 매핑
    const teamNameMapping = {
      'KIA': 'KIA 타이거즈',
      '삼성': '삼성 라이온즈', 
      'LG': 'LG 트윈스',
      '두산': '두산 베어스',
      'KT': 'KT 위즈',
      'SSG': 'SSG 랜더스',
      '롯데': '롯데 자이언츠',
      '한화': '한화 이글스',
      'NC': 'NC 다이노스',
      '키움': '키움 히어로즈'
    };
    
    const fullTeamName = teamNameMapping[teamName] || teamName;
    console.log('🎨 팀 컬러 매핑:', teamName, '->', fullTeamName, TEAM_COLORS[fullTeamName]?.bgColor);
    return TEAM_COLORS[fullTeamName]?.bgColor || '#4CAF50';
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
      <div className="predict-header" style={{ backgroundColor: userTeamColor }}>
        <h1 style={{ color: userTeamTextColor }}>⚾ 승부 예측</h1>
        <p style={{ color: userTeamTextColor, opacity: 0.9 }}>오늘의 KBO 경기에 대한 승부를 예측해보세요!</p>
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
                        <div className="prediction-score">1.00</div>
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
                        <div className="prediction-score">1.00</div>
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
