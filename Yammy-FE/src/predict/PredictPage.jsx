import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePredict, getTeamColor } from './hooks/usePredict';
import { TEAM_COLORS, getTeamColors } from '../sns/utils/teamColors';
import { TeamLogo } from './utils/teamLogo.jsx';
import SettlementModal from './components/SettlementModal';
import { settleMatches } from './api/predictApi';
import './styles/predict.css';
import './styles/TeamLogo.css';

const PredictPage = () => {
  const navigate = useNavigate();
  const [teamColors, setTeamColors] = useState(getTeamColors());
  const [showSettlementModal, setShowSettlementModal] = useState(false);

  // 관리자 권한 확인
  const authority = localStorage.getItem('authority');
  const isAdmin = authority === 'ADMIN';

  console.log('🔍 현재 사용자 권한:', authority);
  console.log('🔍 관리자 여부:', isAdmin);

  // 오늘 날짜 가져오기
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 0부터 시작하므로 +1
  const day = today.getDate();

  // 오늘 날짜 문자열 생성 (YYYY-MM-DD 형식으로 백엔드 데이터와 맞춤)
  const todayDateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  // 경기 데이터 가져오기
  const { matches, loading, error, fetchTodayMatches } = usePredict();

  // 🔥 임시로 전체 경기 보여주기 (날짜 필터링 제거)
  const todayMatches = matches; // 전체 경기 보여주기

  // 팀 컬러 업데이트
  useEffect(() => {
    setTeamColors(getTeamColors());
  }, []);

  // 팀 변경 이벤트 감지
  useEffect(() => {
    const handleTeamChange = () => {
      setTeamColors(getTeamColors());
    };
    window.addEventListener('teamChanged', handleTeamChange);
    return () => window.removeEventListener('teamChanged', handleTeamChange);
  }, []);

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

  // 정산 핸들러
  const handleSettlement = async (settlementData) => {
    try {
      console.log('정산 데이터:', settlementData);

      // API 호출
      const result = await settleMatches(settlementData);

      alert(`정산이 완료되었습니다.\n정산된 경기 수: ${result.settledMatchesCount || settlementData.length}개`);
      setShowSettlementModal(false);

      // 경기 목록 새로고침 (window.location.reload() 대신 리페치)
      await fetchTodayMatches();
    } catch (error) {
      console.error('정산 실패:', error);
      alert(error.message || '정산 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="predict-page">
      <div className="predict-header" style={{ backgroundColor: teamColors.bgColor }}>
        <h1 style={{ color: teamColors.textColor }}>⚾ 승부 예측</h1>
        <div className="predict-header-content">
          <p style={{ color: teamColors.textColor, opacity: 0.9 }}>오늘의 KBO 경기에 대한 승부를 예측해보세요!</p>
          {isAdmin && (
            <button
              className="settlement-button"
              onClick={() => setShowSettlementModal(true)}
            >
              정산하기
            </button>
          )}
        </div>
      </div>
      
      <div className="predict-schedule">
        <h2>{year}년 {month}월 {day}일</h2>
      </div>
      
      <div className="predict-content">
        <div className="today-matches">
          <h2>배팅 가능한 경기</h2>
          
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
                
                // 배팅금액 비율 계산 (homeAmount + awayAmount 기반)
                const totalAmount = match.homeAmount + match.awayAmount;
                const homeAmountRatio = totalAmount > 0 ? match.homeAmount / totalAmount : 0.5; // 기본값 50%
                const awayAmountRatio = totalAmount > 0 ? match.awayAmount / totalAmount : 0.5; // 기본값 50%
                
                return (
                  <div 
                    key={match.id} 
                    className={`match-card-container ${gameInProgress ? 'game-in-progress' : ''}`}
                    onClick={() => handleMatchClick(match.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="match-time-header">{match.gameTime}</div>
                    
                    <div className="match-prediction-card" style={{ display: 'flex' }}>
                      {/* 홈팀 */}
                      <div
                        className="team-section home-team-section"
                        style={{ 
                          backgroundColor: getTeamColor(match.homeTeam),
                          flex: homeAmountRatio
                        }}
                      >
                        <div className="team-label">HOME</div>
                        <div className="team-info-container home-team-info">
                          <TeamLogo teamName={match.homeTeam} size="medium" />
                          <div className="team-details">
                            <div className="team-name">{match.homeTeam}</div>
                            <div className="team-stats">({match.homeWinningRate}%)</div>
                          </div>
                        </div>
                        <div className="prediction-score">{match.homeOdds.toFixed(2)}</div>
                        <div className="total-fansim">총 팬심: {match.homeAmount.toLocaleString()}</div>
                      </div>

                      {/* 중앙 VS */}
                      <div className="vs-section">
                        <span className="vs-text">VS</span>
                      </div>

                      {/* 원정팀 */}
                      <div
                        className="team-section away-team-section"
                        style={{ 
                          backgroundColor: getTeamColor(match.awayTeam),
                          flex: awayAmountRatio
                        }}
                      >
                        <div className="team-label">AWAY</div>
                        <div className="team-info-container away-team-info">
                          <div className="team-details">
                            <div className="team-name">{match.awayTeam}</div>
                            <div className="team-stats">({match.awayWinningRate}%)</div>
                          </div>
                          <TeamLogo teamName={match.awayTeam} size="medium" />
                        </div>
                        <div className="prediction-score">{match.awayOdds.toFixed(2)}</div>
                        <div className="total-fansim">총 팬심: {match.awayAmount.toLocaleString()}</div>
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
            <div className="no-matches">배팅 가능한 경기가 없습니다.</div>
          )}
        </div>
      </div>

      {/* 정산 모달 */}
      {showSettlementModal && (
        <SettlementModal
          matches={todayMatches}
          onClose={() => setShowSettlementModal(false)}
          onSubmit={handleSettlement}
        />
      )}
    </div>
  );
};

export default PredictPage;
