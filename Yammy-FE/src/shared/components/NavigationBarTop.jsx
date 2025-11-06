import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { getMyPoint } from "../../payment/api/pointAPI";
import { getTeamColors } from "../../sns/utils/teamColors";
import logo from "../../assets/images/logo.png";
import gugong from "../../assets/images/gugong.png";
import "./NavigationBar.css";

const NavigationBarTop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("accessToken");
  const { isLoggedIn, user, logOut, initialize } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [teamColors] = useState(getTeamColors());
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);

  const format = (num) => num.toLocaleString();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getMyPoint(token);
        setBalance(res.balance);
      } catch (err) {
        setError("포인트를 불러오지 못했습니다.");
      }
    }
    if (token && isLoggedIn) fetchData();
  }, [token, isLoggedIn]);

  const handleLogout = () => {
    setShowUserMenu(false);
    if (window.confirm("로그아웃 하시겠습니까?")) {
      logOut();
      navigate("/login");
    }
  };

  const goMyPoint = () => navigate("/mypoint");

  const shouldShowBalanceButton =
    isLoggedIn &&
    (location.pathname === "/useditem" || location.pathname === "/mypoint");

  // ✅ 페이지별 로고 변경
  const currentLogo =
    location.pathname === "/useditem" || location.pathname === "/mypoint"
      ? gugong
      : logo;

  return (
    <nav className="nav-bar-top" style={{ backgroundColor: teamColors.bgColor }}>
      <div className="sns-logo" onClick={() => navigate("/")}>
        <img src={currentLogo} alt="Yammy" className="sns-logo-img" />
      </div>

      <div className="header-right">
        {shouldShowBalanceButton ? (
          <div className="ypay-baseball-wrapper">
            <div className="ypay-info" onClick={goMyPoint}>
              <div className="ypay-logo-circle">⚾</div>
              <span className="ypay-balance">
                {balance !== null
                  ? `${format(balance)}원`
                  : error
                  ? "오류"
                  : "로딩 중..."}
              </span>
            </div>
            <button className="ypay-charge-btn" onClick={goMyPoint}>
              충전하기
            </button>
          </div>
        ) : (
          <>
            {isLoggedIn ? (
              <div className="user-menu-wrapper">
                <button
                  className="user-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <i className="fas fa-user-circle"></i>
                  <span className="user-nickname">
                    {user?.nickname || "사용자"}
                  </span>
                  <i
                    className={`fas fa-chevron-down ${
                      showUserMenu ? "rotate" : ""
                    }`}
                  ></i>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <button onClick={() => navigate("/mypage")}>
                      <i className="fas fa-user"></i>
                      내 프로필
                    </button>
                    <button onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i>
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="login-button"
                onClick={() => navigate("/login")}
              >
                로그인
              </button>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default NavigationBarTop;
