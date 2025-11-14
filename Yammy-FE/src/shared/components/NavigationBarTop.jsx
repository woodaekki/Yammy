import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import useAuthStore from "../../stores/authStore";
import { getMyPoint } from "../../payment/api/pointAPI";
import { getTeamColors } from "../../sns/utils/teamColors";
import logo from "../../assets/images/logo.png";
import "./NavigationBar.css";

const NavigationBarTop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("accessToken");
  const { isLoggedIn, user, logOut, initialize, syncFromLocalStorage } = useAuthStore();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [teamColors, setTeamColors] = useState(getTeamColors());
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);

  const dropdownRef = useRef(null);

  const formatYamUnit = (value) => {
    if (value < 10000) {
      return value.toLocaleString(); 
    }

    if (value < 100000000) {
      // 1만 - 1억 미만
      const man = value / 10000; 
      return man % 1 === 0 ? `${man}만` : `${man.toFixed(1)}만`;
    }

    // 1억 이상
    const uk = value / 100000000;
    return uk % 1 === 0 ? `${uk}억` : `${uk.toFixed(1)}억`;
  };

  useEffect(() => {
    initialize();
  }, [initialize]);

  // localStorage 변화 감지
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (["profileImage", "nickname", "team"].includes(e.key)) {
        syncFromLocalStorage();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [syncFromLocalStorage]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      window.addEventListener("click", handleClickOutside);
    } else {
      window.removeEventListener("click", handleClickOutside);
    }

    return () => window.removeEventListener("click", handleClickOutside);
  }, [showUserMenu]);

  // 팀 컬러 업데이트
  useEffect(() => {
    setTeamColors(getTeamColors());
  }, [isLoggedIn]);

  // 팀 변경 이벤트 감지
  useEffect(() => {
    const handleTeamChange = () => setTeamColors(getTeamColors());
    window.addEventListener("teamChanged", handleTeamChange);
    return () => window.removeEventListener("teamChanged", handleTeamChange);
  }, []);

  const shouldHideNav =
    location.pathname.startsWith("/cheerup/") ||
    location.pathname.startsWith("/useditem/chat/");

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
        location.pathname === "/bankstatement" ||
        location.pathname.startsWith("/withdraw") ||
        location.pathname.startsWith("/success") ||
        location.pathname.startsWith("/fail"));

    if (shouldFetch) fetchData();
  }, [token, isLoggedIn, location.pathname]);

  // 포인트 변경 이벤트 감지
  useEffect(() => {
    const handlePointUpdate = () => {
      if (token && isLoggedIn)
        getMyPoint(token).then((res) => setBalance(res.balance));
    };
    window.addEventListener("pointUpdated", handlePointUpdate);
    return () => window.removeEventListener("pointUpdated", handlePointUpdate);
  }, [token, isLoggedIn]);

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
      location.pathname === "/bankstatement" ||
      location.pathname.startsWith("/withdraw") ||
      location.pathname === "/checkout" ||
      location.pathname.startsWith("/success") ||
      location.pathname.startsWith("/fail"));

  const currentLogo = logo;
  
  return createPortal(
    <nav className="nav-bar-top" style={{ backgroundColor: teamColors.bgColor }}>
      <div className="sns-logo" onClick={() => navigate("/")}>
        <img src={currentLogo} alt="Yammy" className="sns-logo-img" />
      </div>

      <div className="header-right">
        {shouldShowBalanceButton ? (
          <div className="ypay-baseball-wrapper">
            <div className="ypay-info" onClick={() => navigate("/bankstatement")}>
              <div className="ypay-logo-circle">⚾</div>

              <span className="ypay-balance">
                {balance !== null
                  ? `${formatYamUnit(balance)}`
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
              <div className="user-menu-wrapper" ref={dropdownRef}>
                <button
                  className="user-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                >
                  <img
                    src={user?.profileImage}
                    alt="프로필"
                    className="user-profile-img"
                  />
                  <i
                    className={`fas fa-chevron-down ${
                      showUserMenu ? "rotate" : ""
                    }`}
                  ></i>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <button onClick={() => navigate("/mypage")}>
                      <i className="fas fa-user"></i> 내 프로필
                    </button>
                    <button onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i> 로그아웃
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
    </nav>,
    document.body
  );
};

export default NavigationBarTop;