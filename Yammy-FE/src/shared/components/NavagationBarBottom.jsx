import { useState } from "react";
import { Link } from "react-router-dom";
import { getTeamColors } from "../../sns/utils/teamColors";
import "./NavigationBar.css";

const NavagationBarBottom = () => {
  const [teamColors] = useState(getTeamColors());

  return (
    <nav className="nav-bar-bottom" style={{ backgroundColor: teamColors.bgColor }}>
      <Link to="/" style={{ color: teamColors.textColor }}>SNS</Link>
      <Link to="/useditem" style={{ color: teamColors.textColor }}>중고거래</Link>
      <Link to="/prediction" style={{ color: teamColors.textColor }}>승부 예측</Link>
      <Link to="/ticket" style={{ color: teamColors.textColor }}>티켓 발급</Link>
      <Link to="/mypage" style={{ color: teamColors.textColor }}>마이페이지</Link>
    </nav>
  );
};

export default NavagtionBarBottom;
