import { Link } from "react-router-dom";
import "./NavigationBar.css";

const NavagationBarBottom = () => {
  return (
    <nav className="nav-bar-bottom">
      <Link to="/">SNS</Link>
      <Link to="/useditem">중고거래</Link>
      <Link to="/prediction">승부 예측</Link>
      <Link to="/cheerup">응원</Link>
      <Link to="/ticket">티켓 발급</Link>
      <Link to="/mypage">마이페이지</Link>
    </nav>
  );
};

export default NavagationBarBottom;
