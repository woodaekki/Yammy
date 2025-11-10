import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTeamColors } from "../../sns/utils/teamColors";
import useAuthStore from "../../stores/authStore";
import "./NavigationBar.css";

const NavigationBarBottom = () => {
  const { isLoggedIn } = useAuthStore();
  const [teamColors, setTeamColors] = useState(getTeamColors());

  // 팀 컬러 업데이트
  useEffect(() => {
    setTeamColors(getTeamColors());
  }, [isLoggedIn]);

  // 팀 변경 이벤트 감지
  useEffect(() => {
    const handleTeamChange = () => {
      setTeamColors(getTeamColors());
    };
    window.addEventListener('teamChanged', handleTeamChange);
    return () => window.removeEventListener('teamChanged', handleTeamChange);
  }, []);

  return (
    <nav className="nav-bar-bottom" style={{ backgroundColor: teamColors.bgColor }}>
      <Link to="/" style={{ color: teamColors.textColor }}>SNS</Link>
      <Link to="/useditem" style={{ color: teamColors.textColor }}>중고거래</Link>
      <Link to="/prediction" style={{ color: teamColors.textColor }}>승부 예측</Link>
      <Link to="/cheerup" style={{ color: teamColors.textColor }}>응원</Link>
      <Link to="/ticket" style={{ color: teamColors.textColor }}>티켓 발급</Link>
      <Link to="/mypage" style={{ color: teamColors.textColor }}>마이페이지</Link>
    </nav>
  );
};

export default NavigationBarBottom;
