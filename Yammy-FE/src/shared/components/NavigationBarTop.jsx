import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { getMyPoint } from "../../payment/api/pointAPI";
import { getTeamColors } from "../../sns/utils/teamColors";
import logo from "../../assets/images/logo.png";
import gugong from "../../assets/images/logo.png";
import "./NavigationBar.css";

const NavigationBarTop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("accessToken");
  const { isLoggedIn, user, logOut, initialize } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [teamColors, setTeamColors] = useState(getTeamColors());
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);

  const format = (num) => num.toLocaleString();

  useEffect(() => {
    initialize();
  }, [initialize]);

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

  // cheerup 하위경로 또는 useditem/chat 하위경로일 때만 네브바 숨김
  const shouldHideNav =
    location.pathname.startsWith("/cheerup/") ||
    location.pathname.startsWith("/useditem/chat/");

  // 포인트 불러오기 함수
  async function fetchData() {
    try {
      const res = await getMyPoint(token);
      setBalance(res.balance);
    } catch (err) {
      setError("포인트를 불러오지 못했습니다.");
    }
  }

  useEffect(() => {
    const shouldFetch =
      token &&
      isLoggedIn &&
      (location.pathname.startsWith("/useditem") ||
        location.pathname === "/mypoint" ||
        location.pathname === "/chatlist" ||
        location.pathname === "/checkout" ||
        location.pathname.startsWith("/success") ||
        location.pathname.startsWith("/fail"));

    if (shouldFetch) fetchData();
  }, [token, isLoggedIn, location.pathname]);

  // 결제 성공 시 즉시 포인트 업데이트
  useEffect(() => {
    const handlePointUpdate = () => {
      if (token && isLoggedIn) {
        getMyPoint(token).then((res) => setBalance(res.balance));
      }
    };
    window.addEventListener("pointUpdated", handlePointUpdate);
    return () => window.removeEventListener("pointUpdated", handlePointUpdate);
  }, [token, isLoggedIn]);

  // 렌더 직전에 네비게이션 숨김 조건 처리 (훅 호출 순서가 항상 동일하도록)
  if (shouldHideNav) return null;

  const handleLogout = () => {
    setShowUserMenu(false);
    if (window.confirm("로그아웃 하시겠습니까?")) {
      logOut();
      navigate("/login");
    }
  };

  const goMyPoint = () => navigate("/mypoint");
  const goChatList = () => navigate("/chatlist");

  const shouldShowBalanceButton =
    isLoggedIn &&
    (location.pathname.startsWith("/useditem") ||
      location.pathname === "/mypoint" ||
      location.pathname === "/chatlist" ||
      location.pathname === "/checkout" ||
      location.pathname.startsWith("/success") ||
      location.pathname.startsWith("/fail"));

  const currentLogo =
    location.pathname.startsWith("/useditem") ||
    location.pathname === "/mypoint" ||
    location.pathname === "/chatlist" ||
    location.pathname === "/checkout" ||
    location.pathname.startsWith("/success") ||
    location.pathname.startsWith("/fail")
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
                  ? (() => {
                      const str = format(balance);
                      return str.length > 5
                        ? `${str.slice(0, 3)}...`
                        : `${str}얌`;
                    })()
                  : error
                  ? "오류"
                  : "로딩 중..."}
              </span>
            </div>
            <button className="chatlist-btn" onClick={goChatList}>
              채팅방
            </button>
            <button className="ypay-charge-btn" onClick={goMyPoint}>
              충전
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
