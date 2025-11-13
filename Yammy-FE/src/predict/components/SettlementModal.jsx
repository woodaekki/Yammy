import React, { useState } from 'react';
import '../styles/SettlementModal.css';

const SettlementModal = ({ matches, onClose, onSubmit }) => {
  // 각 경기의 결과를 저장 (matchId: result)
  // result: 0 = 홈팀 승, 1 = 원정팀 승
  const [results, setResults] = useState({});

  // 결과 선택 핸들러
  const handleResultChange = (matchId, result) => {
    setResults(prev => ({
      ...prev,
      [matchId]: result
    }));
  };

  // 정산 제출
  const handleSubmit = () => {
    // 모든 경기에 대해 결과가 입력되었는지 확인
    const allMatchesSelected = matches.every(match => results[match.id] !== undefined);

    if (!allMatchesSelected) {
      alert('모든 경기의 결과를 선택해주세요.');
      return;
    }

    // 결과를 배열 형태로 변환
    const settlementData = matches.map(match => ({
      matchId: match.id,
      result: results[match.id]
    }));

    onSubmit(settlementData);
  };

  return (
    <div className="settlement-modal-overlay" onClick={onClose}>
      <div className="settlement-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="settlement-modal-header">
          <h2>경기 결과 입력</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="settlement-modal-body">
          {matches.length === 0 ? (
            <p className="no-matches-message">정산할 경기가 없습니다.</p>
          ) : (
            matches.map(match => (
              <div key={match.id} className="match-result-item">
                <div className="match-info">
                  <span className="match-teams">
                    {match.homeTeam} vs {match.awayTeam}
                  </span>
                  <span className="match-time">{match.gameTime}</span>
                </div>

                <div className="result-options">
                  <label className="result-option">
                    <input
                      type="radio"
                      name={`match-${match.id}`}
                      value="0"
                      checked={results[match.id] === 0}
                      onChange={() => handleResultChange(match.id, 0)}
                    />
                    <span>{match.homeTeam} 승리</span>
                  </label>

                  <label className="result-option">
                    <input
                      type="radio"
                      name={`match-${match.id}`}
                      value="1"
                      checked={results[match.id] === 1}
                      onChange={() => handleResultChange(match.id, 1)}
                    />
                    <span>{match.awayTeam} 승리</span>
                  </label>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="settlement-modal-footer">
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={matches.length === 0}
          >
            정산하기
          </button>
          <button className="cancel-button" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default SettlementModal;
