import { Link, useLocation } from "react-router-dom";
import { FaChartLine, FaTicketAlt, FaUser } from "react-icons/fa";
import { GiBaseballBat, GiBaseballGlove, GiMegaphone } from "react-icons/gi";
import { getTeamColors } from "../../sns/utils/teamColors";
import useAuthStore from "../../stores/authStore";
import { useState, useEffect } from "react";
import "./NavigationBar.css";

const NavigationBarBottom = () => {
  const { isLoggedIn } = useAuthStore();
  const location = useLocation();
  const [teamColors, setTeamColors] = useState(getTeamColors());

  useEffect(() => {
    setTeamColors(getTeamColors());
  }, [isLoggedIn]);

  useEffect(() => {
    const handleTeamChange = () => setTeamColors(getTeamColors());
    window.addEventListener("teamChanged", handleTeamChange);
    return () => window.removeEventListener("teamChanged", handleTeamChange);
  }, []);

  const links = [
    { to: "/", label: "SNS", icon: <GiBaseballBat /> },
    { to: "/useditem", label: "거래", icon: <GiBaseballGlove /> },
    { to: "/prediction", label: "예측", icon: <FaChartLine /> },
    { to: "/cheerup", label: "응원", icon: <GiMegaphone /> },
    { to: "/ticket", label: "티켓", icon: <FaTicketAlt /> },
    { to: "/mypage", label: "프로필", icon: <FaUser /> },
  ];

  // 하위 경로 포함 체크 함수
  const isActiveLink = (linkTo) => {
    const pathname = location.pathname;
    // 홈(/)은 정확히 일치할 때만 활성화
    if (linkTo === "/") {
      return pathname === "/";
    }
    // 나머지는 해당 경로로 시작하면 활성화
    return pathname.startsWith(linkTo);
  };

  return (
    <nav
      className="nav-bar-bottom"
      style={{ backgroundColor: teamColors.bgColor }}
    >
      {links.map((link) => {
        const isActive = isActiveLink(link.to);
        return (
          <Link
            key={link.to}
            to={link.to}
            className={isActive ? "active" : ""}
            style={{
              color: isActive ? "#ffffff" : "rgba(255,255,255,0.75)",
            }}
          >
            <div className="icon">{link.icon}</div>
            <span className="nav-label">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default NavigationBarBottom;
