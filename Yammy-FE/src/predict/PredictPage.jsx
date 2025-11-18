import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePredict, getTeamColor } from './hooks/usePredict';
import { TEAM_COLORS, getTeamColors } from '../sns/utils/teamColors';
import { TeamLogo } from './utils/teamLogo.jsx';
import SettlementModal from './components/SettlementModal';
import { settleMatches } from './api/predictApi';
import yammyPick from '../assets/images/yammy_pick.png';
import './styles/predict.css';
import './styles/TeamLogo.css';

const PredictPage = () => {
  const navigate = useNavigate();
  const [teamColors, setTeamColors] = useState(getTeamColors());
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showOddsTooltip, setShowOddsTooltip] = useState(false);

  const authority = localStorage.getItem('authority');
  const isAdmin = authority === 'ADMIN';

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const todayDateString = `${year}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`;

  const { matches, loading, error, fetchTodayMatches } = usePredict();
  const todayMatches = matches;
  const allSettled =
    todayMatches.length > 0 && todayMatches.every((match) => match.isSettled === 1);

  useEffect(() => {
    setTeamColors(getTeamColors());
  }, []);

  useEffect(() => {
    const handleTeamChange = () => setTeamColors(getTeamColors());
    window.addEventListener('teamChanged', handleTeamChange);
    return () => window.removeEventListener('teamChanged', handleTeamChange);
  }, []);

  const isGameInProgress = (gameTime) => {
    const now = new Date();
    const [gameHours, gameMinutes] = gameTime.split(':').map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const gameMinutesTotal = gameHours * 60 + gameMinutes;
    return currentMinutes > gameMinutesTotal - 1;
  };

  const handleMatchClick = (matchId) => {
    navigate(`/prediction/${matchId}`);
  };

  const handleSettlement = async (settlementData) => {
    try {
      const result = await settleMatches(settlementData);
      alert(`정산이 완료되었습니다.\n정산된 경기 수: ${result.settledMatchesCount || settlementData.length}개`);
      setShowSettlementModal(false);
      await fetchTodayMatches();
    } catch (error) {
      console.error('Settlement error:', error.message);
      alert(error.message || '정산 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="predict-page">
      <div className="predict-schedule">
        <h2>{year}년 {month}월 {day}일 승부예측</h2>
      </div>

      <div className="predict-content">
        <div className="today-matches">
          <div className="matches-header">
            <h2>오늘의 경기</h2>
            {isAdmin && (
              <button
                className="settlement-button"
                onClick={() => setShowSettlementModal(true)}
                disabled={allSettled || todayMatches.length === 0}
              >
                정산하기
              </button>
            )}

            <div className="odds-info-wrapper">
              <button className="odds-info-button" onClick={() => setShowOddsTooltip(!showOddsTooltip)}>
                ⓘ 배당률이란?
              </button>
              {showOddsTooltip && (
                <div className="odds-tooltip">
                  <div className="tooltip-header">
                    <strong>배당률이란?</strong>
                    <button className="tooltip-close" onClick={() => setShowOddsTooltip(false)}>×</button>
                  </div>
                  <div className="tooltip-content">
                    <p><strong>배당률 2.00이라면:</strong></p>
                    <p>• 100팬심 배팅 시 승리하면 200팬심을 받는다</p>
                    <p>• 즉, 팬심 100 + 수익 100 = 총 200팬심</p>
                    <br/>
                    <p><strong>계산법:</strong></p>
                    <p>• 투입팬심 × 배당률 = 받을 팬심</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {loading && <div className="loading">경기 데이터를 불러오는 중...</div>}
          {error && <div className="error">{error}</div>}

          {!loading && !error && todayMatches.length > 0 && (
            <div className="matches-list">
              {todayMatches.map((match) => {
                const gameInProgress = isGameInProgress(match.gameTime);
                const isSettled = match.isSettled === 1;
                const totalAmount = match.homeAmount + match.awayAmount;

                return (
                  <div
                    key={match.id}
                    className={`match-card-container ${gameInProgress ? 'game-in-progress' : ''} ${isSettled ? 'settled' : ''}`}
                    onClick={() => !isSettled && handleMatchClick(match.id)}
                  >
                    <div className="match-time-header">{match.gameTime}</div>
                    <div className="match-prediction-card">
                      <div className="match-teams-section">
                        {/* HOME */}
                        <div className="team-column home-column">
                          <div className="team-label-new">
                            {match.aiPick === 0 && (
                              <img src={yammyPick} alt="Yammy Pick" className="yammy-pick-label" />
                            )}
                            HOME
                          </div>
                          <div className="team-logo-name">
                            <TeamLogo teamName={match.homeTeam} size="medium" />
                            <div className="team-name-new">{match.homeTeam}</div>
                          </div>
                          <div className="team-stat-row">예상 승률: {match.homeWinningRate}%</div>
                          <div className="team-stat-row">배당률: {match.homeOdds.toFixed(2)}</div>
                          <div className="team-stat-row">총 팬심: {match.homeAmount.toLocaleString()}</div>
                        </div>

                        {/* VS */}
                        <div className="vs-section-new">
                          <span className="vs-text">VS</span>
                        </div>

                        {/* AWAY */}
                        <div className="team-column away-column">
                          <div className="team-label-new">
                            {match.aiPick === 1 && (
                              <img src={yammyPick} alt="Yammy Pick" className="yammy-pick-label" />
                            )}
                            AWAY
                          </div>
                          <div className="team-logo-name">
                            <TeamLogo teamName={match.awayTeam} size="medium" />
                            <div className="team-name-new">{match.awayTeam}</div>
                          </div>
                          <div className="team-stat-row">예상 승률: {match.awayWinningRate}%</div>
                          <div className="team-stat-row">배당률: {match.awayOdds.toFixed(2)}</div>
                          <div className="team-stat-row">총 팬심: {match.awayAmount.toLocaleString()}</div>
                        </div>
                      </div>

                      {/* 그래프 섹션 */}
                      <div className="match-graph-section">
                        <div className="betting-ratio-bar">
                          <div
                            className="home-ratio-bar"
                            style={{
                              width: `${Math.max(20, Math.min(80, (match.homeAmount / totalAmount * 100))).toFixed(1)}%`,
                              backgroundColor: getTeamColor(match.homeTeam)
                            }}
                          >
                            <span className="ratio-text">{match.homeAmount.toLocaleString()}</span>
                          </div>
                          <div
                            className="away-ratio-bar"
                            style={{
                              width: `${Math.max(20, Math.min(80, (match.awayAmount / totalAmount * 100))).toFixed(1)}%`,
                              backgroundColor: getTeamColor(match.awayTeam)
                            }}
                          >
                            <span className="ratio-text">{match.awayAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {gameInProgress && (
                      <div className="game-progress-overlay">
                        <div className="progress-message">경기가 이미 진행중입니다</div>
                      </div>
                    )}

                    {isSettled && (
                      <div className="game-progress-overlay settled-overlay">
                        <div className="progress-message">정산 완료</div>
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

      {showSettlementModal && (
        <SettlementModal
          matches={todayMatches.filter(match => match.isSettled === 0)}
          onClose={() => setShowSettlementModal(false)}
          onSubmit={handleSettlement}
        />
      )}
    </div>
  );
};

export default PredictPage;
