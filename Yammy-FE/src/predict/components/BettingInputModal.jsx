import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeamColor } from '../hooks/usePredict';
import { createBetting, getMemberInfo } from '../api/predictApi';
import { TeamLogo } from '../utils/teamLogo.jsx';
import yammyPick from '../../assets/images/yammy_pick.png';
import '../styles/BettingInputModal.css';
import '../styles/TeamLogo.css';

const BettingInputModal = ({ match, selectedTeam, onClose, onBettingSuccess }) => {
  const navigate = useNavigate();
  const [betAmount, setBetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [pointsLoading, setPointsLoading] = useState(true);
  const [validationMessage, setValidationMessage] = useState('팬심을 입력해주세요'); // 실시간 검증 메시지

  // 선택된 팀 정보
  const selectedTeamInfo = selectedTeam === 0 
    ? { name: match?.homeTeam, odds: match?.homeOdds, label: 'HOME' }
    : { name: match?.awayTeam, odds: match?.awayOdds, label: 'AWAY' };

  // 예상 수익 계산 (콤마 제거 후 계산)
  const betAmountForCalc = betAmount ? parseFloat(betAmount.replace(/,/g, '')) : 0;
  const expectedReturn = betAmountForCalc ? (betAmountForCalc * selectedTeamInfo.odds).toFixed(0) : '0';
  const expectedProfit = betAmountForCalc ? (betAmountForCalc * (selectedTeamInfo.odds - 1)).toFixed(0) : '0';

  // 사용자 팬심 로드
  useEffect(() => {
    const loadUserPoints = async () => {
      try {
        setPointsLoading(true);
        const memberInfo = await getMemberInfo();
        setUserPoints(memberInfo.exp || 0); // exp가 팬심
      } catch (error) {
        console.error('Error loading user points:', error.message);
        setUserPoints(0);
      } finally {
        setPointsLoading(false);
      }
    };

    loadUserPoints();
  }, []);

  // 모바일에서 바디 스크롤 방지
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // 배팅 금액 입력 핸들러 + 실시간 검증
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // 콤마 제거
    const valueWithoutComma = value.replace(/,/g, '');

    // 숫자만 입력 가능
    if (valueWithoutComma === '' || /^\d+$/.test(valueWithoutComma)) {
      // 콤마 추가해서 표시
      const formattedValue = valueWithoutComma === '' ? '' : parseInt(valueWithoutComma).toLocaleString();
      setBetAmount(formattedValue);

      // 실시간 검증
      if (valueWithoutComma === '') {
        setValidationMessage('팬심을 입력해주세요');
      } else {
        const betAmountNum = parseFloat(valueWithoutComma);

        // 최소 배팅 금액 검사 (100팬심)
        if (betAmountNum < 100) {
          setValidationMessage(`${formattedValue}팬심 - 최소 배팅 금액은 100팬심입니다`);
        } else if (betAmountNum > userPoints) {
          setValidationMessage(`${formattedValue}팬심 - 보유 팬심을 초과하였습니다`);
        } else {
          setValidationMessage(`${formattedValue}팬심 입력하였습니다`);
        }
      }
    }
  };

  // 배팅하기 버튼 클릭
  const handleBet = async () => {
    // 콤마 제거
    const betAmountWithoutComma = betAmount.replace(/,/g, '');

    if (!betAmountWithoutComma || parseFloat(betAmountWithoutComma) <= 0) {
      alert('배팅 팬심을 입력해주세요.');
      return;
    }

    const betAmountNum = parseFloat(betAmountWithoutComma);

    // 최소 배팅 금액 검사 (100팬심)
    if (betAmountNum < 100) {
      alert('최소 배팅 금액은 100팬심입니다.');
      return;
    }

    // 팬심 부족 검사 (실시간 검증으로 이미 처리되지만 한번 더 체크)
    if (betAmountNum > userPoints) {
      alert(`팬심이 부족합니다.\n현재 팬심: ${userPoints.toLocaleString()}팬심\n필요 팬심: ${betAmountNum.toLocaleString()}팬심`);
      return;
    }

    setLoading(true);
    try {
      // 백엔드 API 호출 - 백엔드 DTO와 타입 맞춤
      const bettingData = {
        matchId: Number(match.id), // Long으로 변환
        selectedTeam: selectedTeam, // Integer (0 또는 1)
        betAmount: Math.floor(betAmountNum), // Long으로 변환 (정수)
        expectedReturn: Math.floor(parseFloat(expectedReturn)) // Long으로 변환 (정수)
      };
      
      await createBetting(bettingData);

      // 성공 처리
      alert('배팅 완료!');
      onClose(); // 모달 닫기
      navigate('/prediction'); // PredictPage로 이동

      // 배팅 성공 후 경기 목록 새로고침
      if (onBettingSuccess) {
        await onBettingSuccess();
      }
    } catch (error) {
      console.error('Betting error:', error.message);
      const errorMessage = error.message || '배팅에 실패했습니다. 다시 시도해주세요.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 모달 배경 클릭시 닫기
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!match || selectedTeam === null || selectedTeam === undefined) {
    return null;
  }

  return (
    <div className="betting-modal-backdrop" onClick={handleBackdropClick}>
      <div className="betting-modal-container">
        <div className="betting-modal-header">
          <h2>배팅하기</h2>
          <button className="close-button" onClick={onClose}>X</button>
        </div>

        <div className="betting-modal-content">
          {/* 배팅금액 비교 그래프 */}
          <div className="odds-comparison-section">
            <h3>배팅 현황 비교</h3>
            <div className="odds-comparison-bar">
              <div
                className={`team-odds-portion ${selectedTeam === 0 ? 'selected' : ''}`}
                style={{
                  width: '50%',
                  backgroundColor: getTeamColor(match.homeTeam)
                }}
              >
                <div className="odds-info">
                  <span className="team-name-small">{match.homeTeam}</span>
                  <span className="odds-value">{match.homeAmount.toLocaleString()}팬심</span>
                </div>
              </div>
              <div
                className={`team-odds-portion ${selectedTeam === 1 ? 'selected' : ''}`}
                style={{
                  width: '50%',
                  backgroundColor: getTeamColor(match.awayTeam)
                }}
              >
                <div className="odds-info">
                  <span className="team-name-small">{match.awayTeam}</span>
                  <span className="odds-value">{match.awayAmount.toLocaleString()}팬심</span>
                </div>
              </div>
            </div>
          </div>

          {/* 선택된 팀 */}
          <div className="selected-team-info">
            <h3>선택한 팀</h3>
            <div
              className="selected-team-card"
              style={{
                backgroundColor: getTeamColor(selectedTeamInfo.name),
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* 배당률 비율 배경 */}
              <div
                className="odds-ratio-background"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `100%`,
                  height: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  zIndex: 1
                }}
              />

              <div style={{ position: 'relative', zIndex: 2 }}>
                <div className="team-label">
                  {match.aiPick === selectedTeam && (
                    <img src={yammyPick} alt="Yammy Pick" className="yammy-pick-label" />
                  )}
                  {selectedTeamInfo.label}
                </div>
                <div className="team-info-container">
                  <TeamLogo teamName={selectedTeamInfo.name} size="large" />
                  <div className="team-details">
                    <div className="team-name">{selectedTeamInfo.name}</div>
                    <div className="team-odds">{selectedTeamInfo.odds.toFixed(2)}</div>
                    <div className="odds-ratio-text">예상 승률 :
                      {((match.homeAmount + match.awayAmount) > 0 ?
                        (selectedTeam === 0 ?
                         (match.homeAmount / (match.homeAmount + match.awayAmount)) * 100 :
                         (match.awayAmount / (match.homeAmount + match.awayAmount)) * 100) : 50).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 배팅 팬심 입력 */}
          <div className="bet-amount-section">
            <div className="amount-header">
              <h3>배팅 팬심</h3>
              <div className="current-points">
                {pointsLoading ? (
                  <span>로딩중...</span>
                ) : (
                  <span>보유 팬심: <strong>{userPoints.toLocaleString()}팬심</strong></span>
                )}
              </div>
            </div>
            <div className="amount-input-container">
              <input
                type="text"
                value={betAmount}
                onChange={handleAmountChange}
                placeholder="100팬심 이상 입력하세요"
                className="amount-input"
              />
              <div>팬심</div>
            </div>
            <div className={`validation-message ${validationMessage.includes('입력하였습니다') ? 'success' : 'error'}`}>
              {validationMessage}
            </div>
          </div>

          {/* 버튼들 */}
          <div className="action-buttons">
            <button
              className="bet-button"
              onClick={handleBet}
              disabled={loading || !betAmount || !validationMessage.includes('입력하였습니다')}
              style={{ backgroundColor: getTeamColor(selectedTeamInfo.name) }}
            >
              {loading ? '처리중...' : '배팅하기'}
            </button>
            <button 
              className="cancel-button" 
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BettingInputModal;
