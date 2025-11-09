import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePredict } from '../hooks/usePredict';
import { TEAM_COLORS } from '../../sns/utils/teamColors';
import '../styles/BettingPage.css';

const BettingPage = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();

  // 경기 데이터 가져오기
  const { matches, loading, error } = usePredict();

  // 현재 경기 찾기
  const match = matches.find(m => m.id === parseInt(matchId));

  // 팀 컬러 가져오기 함수 (짧은 이름 → 전체 이름 매핑)
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
    console.log('🎨 BettingPage 팀 컬러 매핑:', teamName, '->', fullTeamName, TEAM_COLORS[fullTeamName]?.bgColor);
    return TEAM_COLORS[fullTeamName]?.bgColor || '#4CAF50';
  };

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

  // 로딩 중인 경우
  if (loading) {
    return (
      <div className="betting-page">
        <div className="betting-header">
          <button className="back-button" onClick={handleGoBack}>
            ← 뒤로가기
          </button>
          <h1>⚾ 승부 예측</h1>
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
          <h1>⚾ 승부 예측</h1>
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

  return (
    <div className="betting-page">
      <div className="betting-header">
        <button className="back-button" onClick={handleGoBack}>
          ← 뒤로가기
        </button>
        <h1>⚾ 승부 예측</h1>
      </div>

      {/* 경기 진행중인 경우 */}
      {gameInProgress && (
        <div className="unavailable-betting">
          <div className="unavailable-message">
            <h2>⏰ 예측할 수 없는 경기입니다</h2>
            <p>이미 진행중인 경기는 예측할 수 없습니다.</p>
          </div>
        </div>
      )}

      {/* 예측 가능한 경기인 경우 */}
      {!gameInProgress && (
        <div className="betting-content">
          {/* 경기 정보 헤더 */}
          <div className="match-info-header">
            <div className="match-date-time">
              <span className="match-date">{match.date}</span>
              <span className="match-time">{match.gameTime}</span>
            </div>
            <div className="match-stadium">{match.stadium}</div>
          </div>

          {/* 팀 vs 팀 섹션 */}
          <div className="teams-section">
            <div className="team-card home-team">
              <div 
                className="team-background"
                style={{ backgroundColor: getTeamColor(match.homeTeam) }}
              >
                <div className="team-label">HOME</div>
                <div className="team-name">{match.homeTeam}</div>
                <div className="team-rate">예상승률 {match.homeWinningRate}%</div>
                <div className="team-odds">1.00</div>
              </div>
            </div>

            <div className="vs-divider">
              <span className="vs-text">VS</span>
            </div>

            <div className="team-card away-team">
              <div 
                className="team-background"
                style={{ backgroundColor: getTeamColor(match.awayTeam) }}
              >
                <div className="team-label">AWAY</div>
                <div className="team-name">{match.awayTeam}</div>
                <div className="team-rate">예상승률 {match.awayWinningRate}%</div>
                <div className="team-odds">1.00</div>
              </div>
            </div>
          </div>

          {/* 경기 상세 정보 */}
          <div className="match-details">
            <h3>경기 정보</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">경기 일시</span>
                <span className="detail-value">{match.date} {match.gameTime}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">경기장</span>
                <span className="detail-value">{match.stadium}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">홈팀</span>
                <span className="detail-value">{match.homeTeam}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">원정팀</span>
                <span className="detail-value">{match.awayTeam}</span>
              </div>
            </div>
          </div>

          {/* 베팅 섹션 */}
          <div className="betting-section">
            <h3>예측하기</h3>
            <div className="betting-options">
              <button 
                className="betting-button home-betting"
                style={{ backgroundColor: getTeamColor(match.homeTeam) }}
              >
                <span className="bet-team">{match.homeTeam}</span>
                <span className="bet-odds">1.00</span>
              </button>
              <button 
                className="betting-button away-betting"
                style={{ backgroundColor: getTeamColor(match.awayTeam) }}
              >
                <span className="bet-team">{match.awayTeam}</span>
                <span className="bet-odds">1.00</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BettingPage;
