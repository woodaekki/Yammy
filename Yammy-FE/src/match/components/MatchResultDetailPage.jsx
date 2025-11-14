import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMatch } from "../hooks/useMatch";
import "../styles/match.css";

function MatchResultDetailPage() {
  const { matchcode } = useParams(); 
  const navigate = useNavigate();
  const { getMatchByMatchcode } = useMatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchData, setMatchData] = useState(null);

  useEffect(() => {
    const loadMatchDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        await new Promise(resolve => setTimeout(resolve, 500));

        const foundMatch = await getMatchByMatchcode(matchcode);

        if (foundMatch) {
          setMatchData(foundMatch);
        } else {
          setError("해당 경기의 데이터를 찾을 수 없습니다.");
        }

      } catch (err) {
        console.error('Match detail loading error:', err.message);
        setError("경기 상세 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (matchcode) {
      loadMatchDetail();
    }
  }, [matchcode, getMatchByMatchcode]);

  if (loading) {
    return <div className="loading">경기 상세 정보를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!matchData) {
    return <div className="error">경기 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="match-detail-container">
      {/* 헤더 */}
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate("/match")}>
          ←
        </button>
        <h1 className="header-title">경기 상세</h1>
        <div className="header-space" />
      </div>

      {/* 경기 기본 정보 */}
      <div className="match-summary">
        <div className="match-code-header">
          <h2>{matchData.matchcode ? matchData.matchcode.replace(/\[|\]/g, '').split(', ').join(', ') : '없음'}</h2>
        </div>
      </div>

      {/* 경기 상세 정보 */}
      <div className="match-details">
        <div className="match-basic-info">
          <h3>경기 정보</h3>
          <div className="info-grid">
            <span className="info-item">구장: {matchData.stadium ? matchData.stadium.replace(/\[|\]/g, '').split(', ').join(', ') : '없음'}</span>
            <span className="info-item">시작: {matchData.starttime ? matchData.starttime.replace(/\[|\]/g, '').split(', ').join(', ') : '없음'}</span>
            <span className="info-item">종료: {matchData.endtime ? matchData.endtime.replace(/\[|\]/g, '').split(', ').join(', ') : '없음'}</span>
            <span className="info-item">경기시간: {matchData.gametime ? matchData.gametime.replace(/\[|\]/g, '').split(', ').join(', ') : '없음'}</span>
            <span className="info-item">관중: {matchData.crowd ? matchData.crowd.replace(/\[|\]/g, '').split(', ').join(', ') + '명' : '없음'}</span>
          </div>
        </div>
        
        <div className="match-game-stats">
          <h3>경기 기록</h3>
          <div className="stats-grid">
            <span className="stat-item">결승타: {matchData.gwrbi ? matchData.gwrbi.replace(/\[|\]/g, '').split(', ').join(', ') : '없음'}</span>
            <span className="stat-item">실책: {matchData.err ? matchData.err.replace(/\[|\]/g, '').split(', ').join(', ') : '없음'}</span>
            <span className="stat-item">도루: {matchData.sb ? matchData.sb.replace(/\[|\]/g, '').split(', ').join(', ') : '없음'}</span>
            <span className="stat-item">도루실패: {matchData.cs ? matchData.cs.replace(/\[|\]/g, '').split(', ').join(', ') : '없음'}</span>
            <span className="stat-item">2루타: {matchData.doublehit ? matchData.doublehit.replace(/\[|\]/g, '').split(', ').join(', ') : '없음'}</span>
            <span className="stat-item">3루타: {matchData.triple ? matchData.triple.replace(/\[|\]/g, '').split(', ').join(', ') : '없음'}</span>
            <span className="stat-item">홈런: {matchData.homerun ? matchData.homerun.replace(/\[|\]/g, '').split(', ').join(', ') : '없음'}</span>
            <span className="stat-item">병살타: {matchData.doubleout ? matchData.doubleout.replace(/\[|\]/g, '').split(', ').join(', ') : '없음'}</span>
            <span className="stat-item">견제사: {matchData.pickoff ? matchData.pickoff.replace(/\[|\]/g, '').split(', ').join(', ') : '없음'}</span>
            <span className="stat-item">폭투: {matchData.wildpitch ? matchData.wildpitch.replace(/\[|\]/g, '').split(', ').join(', ') : '없음'}</span>
            <span className="stat-item">포일: {matchData.passedball ? matchData.passedball.replace(/\[|\]/g, '').split(', ').join(', ') : '없음'}</span>
            <span className="stat-item">잔루: {matchData.oob ? matchData.oob.replace(/\[|\]/g, '').split(', ').join(', ') : '없음'}</span>
          </div>
        </div>
        
        
        <div className="match-officials">
          <h3>경기 운영</h3>
          <div className="officials-info">
            <div className="referee-item">
              <strong>심판:</strong> {matchData.referee ? matchData.referee.replace(/\[|\]/g, '').split(', ').join(', ') : '없음'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchResultDetailPage;