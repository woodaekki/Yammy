import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePredict, getTeamColor, getFullTeamName } from '../hooks/usePredict';
import { TEAM_COLORS } from '../../sns/utils/teamColors';
import { TeamLogo } from '../utils/teamLogo.jsx';
import BettingInputModal from './BettingInputModal';
import { useAuthStore } from '../../stores/authStore'; // 인증 상태 확인
import yammyPick from '../../assets/images/yammy_pick.png';
import '../styles/BettingPage.css';
import '../styles/TeamLogo.css';

const BettingPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState(null); // 0: 홈팀, 1: 원정팀
  const [showBettingModal, setShowBettingModal] = useState(false);
  
  // 인증 상태 확인
  const { isLoggedIn } = useAuthStore();

  // 경기 데이터 가져오기
  const { matches, loading, error, fetchTodayMatches } = usePredict();

  // 현재 경기 찾기
  const match = matches.find(m => m.id === parseInt(matchId));

  // 경기 진행 여부 확인 함수
  const isGameInProgress = (gameTime) => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    
    const [gameHours, gameMinutes] = gameTime.split(':').map(Number);
    
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
    const gameTimeInMinutes = gameHours * 60 + gameMinutes;
    
    return currentTimeInMinutes > gameTimeInMinutes;
  };

  // 뒤로가기 함수
  const handleGoBack = () => {
    navigate(-1);
  };

  // 팀 선택 함수
  const handleTeamSelect = (teamIndex) => {
    // 로그인하지 않은 경우 로그인 페이지로 이동
    if (!isLoggedIn) {
      alert('배팅을 하기 위해서는 로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    
    setSelectedTeam(teamIndex);
    setShowBettingModal(true);
  };

  // 모달 닫기 함수
  const handleCloseModal = () => {
    setShowBettingModal(false);
    setSelectedTeam(null);
  };

  // 로딩 중인 경우
  if (loading) {
    return (
      <div className="betting-page">
        <div className="betting-header">
          <button className="back-button" onClick={handleGoBack}>
            ← 뒤로가기
          </button>
          <h1>승부 예측</h1>
        </div>
        <div className="loading-state">
          <h2>경기 데이터를 불러오는 중...</h2>
        </div>
      </div>
    );
  }

  // 에러가 있는 경우
  if (error) {
    return (
      <div className="betting-page">
        <div className="betting-header">
          <button className="back-button" onClick={handleGoBack}>
            ← 뒤로가기
          </button>
          <h1>승부 예측</h1>
        </div>
        <div className="error-state">
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // 경기가 없는 경우
  if (!match) {
    return (
      <div className="betting-page">
        <div className="betting-header">
          <button className="back-button" onClick={handleGoBack}>
            ← 뒤로가기
          </button>
          <h1>경기를 찾을 수 없습니다</h1>
        </div>
      </div>
    );
  }

  const gameInProgress = isGameInProgress(match.gameTime);
  const isSettled = match.isSettled === 1;  // 정산 완료 여부

  return (
    <div className="betting-page">
      <div className="betting-header">
        <button className="back-button" onClick={handleGoBack}>
          ← 뒤로가기
        </button>
        <h1>승부 예측</h1>
      </div>

      {/* 정산 완료된 경기인 경우 */}
      {isSettled && (
        <div className="unavailable-betting">
          <div className="unavailable-message settled-message">
            <h2>정산 완료</h2>
            <p>이미 정산이 완료된 경기입니다.</p>
          </div>
        </div>
      )}

      {/* 경기 진행중인 경우 */}
      {!isSettled && gameInProgress && (
        <div className="unavailable-betting">
          <div className="unavailable-message">
            <h2>예측할 수 없는 경기입니다</h2>
            <p>이미 진행중인 경기는 예측할 수 없습니다.</p>
          </div>
        </div>
      )}

      {/* 예측 가능한 경기인 경우 */}
      {!isSettled && !gameInProgress && (
        <div className="betting-content">
          {/* 배당정보 + 예측하기 통합 섹션 */}
          <div className="odds-section">
            <div className="match-time">{match.gameTime}</div>
            
            {/* 비로그인 사용자에게 안내 메시지 */}
            {!isLoggedIn && (
              <div className="login-required-notice">
                <p>배팅을 하기 위해서는 로그인이 필요합니다</p>
                <button 
                  className="login-button"
                  onClick={() => navigate('/login')}
                >
                  로그인 하러가기
                </button>
              </div>
            )}
            <div className="betting-match-card">
              <div className="betting-match-info-section">
                {/* HOME */}
                <div
                  className={`betting-team-column ${selectedTeam === 0 ? 'selected' : ''}`}
                  style={{
                    background: `linear-gradient(135deg, ${getTeamColor(match.homeTeam)}25 0%, ${getTeamColor(match.homeTeam)}12 100%)`
                  }}
                  onClick={() => handleTeamSelect(0)}
                >
                  <div className="betting-team-label">
                    {match.aiPick === 0 && (
                      <img src={yammyPick} alt="Yammy Pick" className="yammy-pick-label" />
                    )}
                    HOME
                  </div>
                  <div className="betting-team-logo-name">
                    <TeamLogo teamName={match.homeTeam} size="medium" />
                    <div className="betting-team-name">{match.homeTeam}</div>
                  </div>
                  <div className="betting-team-stat-row">예상 승률: {match.homeWinningRate}%</div>
                  <div className="betting-team-stat-row">배당률: {match.homeOdds.toFixed(2)}</div>
                  <div className="betting-team-stat-row">총 팬심: {match.homeAmount.toLocaleString()}</div>
                </div>

                {/* VS */}
                <div className="betting-vs-section">
                  <span className="vs-text">VS</span>
                </div>

                {/* AWAY */}
                <div
                  className={`betting-team-column ${selectedTeam === 1 ? 'selected' : ''}`}
                  style={{
                    background: `linear-gradient(135deg, ${getTeamColor(match.awayTeam)}25 0%, ${getTeamColor(match.awayTeam)}12 100%)`
                  }}
                  onClick={() => handleTeamSelect(1)}
                >
                  <div className="betting-team-label">
                    {match.aiPick === 1 && (
                      <img src={yammyPick} alt="Yammy Pick" className="yammy-pick-label" />
                    )}
                    AWAY
                  </div>
                  <div className="betting-team-logo-name">
                    <TeamLogo teamName={match.awayTeam} size="medium" />
                    <div className="betting-team-name">{match.awayTeam}</div>
                  </div>
                  <div className="betting-team-stat-row">예상 승률: {match.awayWinningRate}%</div>
                  <div className="betting-team-stat-row">배당률: {match.awayOdds.toFixed(2)}</div>
                  <div className="betting-team-stat-row">총 팬심: {match.awayAmount.toLocaleString()}</div>
                </div>
              </div>

              {/* 그래프 섹션 */}
              <div className="betting-graph-section">
                <div className="betting-ratio-bar-graph">
                  <div
                    className="home-ratio-bar"
                    style={{
                      width: `${Math.max(20, Math.min(80, (match.homeAmount / (match.homeAmount + match.awayAmount) * 100))).toFixed(1)}%`,
                      backgroundColor: getTeamColor(match.homeTeam)
                    }}
                  >
                    <span className="ratio-text">{match.homeAmount.toLocaleString()}</span>
                  </div>
                  <div
                    className="away-ratio-bar"
                    style={{
                      width: `${Math.max(20, Math.min(80, (match.awayAmount / (match.homeAmount + match.awayAmount) * 100))).toFixed(1)}%`,
                      backgroundColor: getTeamColor(match.awayTeam)
                    }}
                  >
                    <span className="ratio-text">{match.awayAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 경기 정보 섹션 */}
          <div className="match-info-section">
            <h3>경기 정보</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">시작 시간</span>
                <span className="info-value">{match.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1년 $2월 $3일 ')} {match.gameTime}</span>
              </div>
              <div className="info-item">
                <span className="info-label">경기장</span>
                <span className="info-value">{match.stadium}</span>
              </div>
              <div className="info-item">
                <span className="info-label">홈팀</span>
                <span className="info-value">{getFullTeamName(match.homeTeam)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">원정팀</span>
                <span className="info-value">{getFullTeamName(match.awayTeam)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 배팅 입력 모달 */}
      {showBettingModal && (
        <BettingInputModal
          match={match}
          selectedTeam={selectedTeam}
          onClose={handleCloseModal}
          onBettingSuccess={fetchTodayMatches}
        />
      )}
    </div>
  );
};

export default BettingPage;
