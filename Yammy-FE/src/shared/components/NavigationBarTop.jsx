import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { getMyPoint } from "../../payment/api/pointAPI";
import { getMemberInfo } from "../../predict/api/predictApi";
import { getTeamColors } from "../../sns/utils/teamColors";
import logo from "../../assets/images/logo.png";
import "./NavigationBar.css";
import { usedItemChatApi } from "../../useditemchat/api/usedItemChatApi";
const NavigationBarTop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("accessToken");
  const { isLoggedIn, user, logOut, initialize, syncFromLocalStorage } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [teamColors, setTeamColors] = useState(getTeamColors());
  const [balance, setBalance] = useState(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [error, setError] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [pointsLoading, setPointsLoading] = useState(true);
  const dropdownRef = useRef(null); 

  const format = (num) => num.toLocaleString();

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
        location.pathname.startsWith("/success") ||
        location.pathname.startsWith("/fail"));
    if (shouldFetch) fetchData();
  }, [token, isLoggedIn, location.pathname]);

  useEffect(() => {
    const handlePointUpdate = () => {
      if (token && isLoggedIn) getMyPoint(token).then((res) => setBalance(res.balance));
    };
    window.addEventListener("pointUpdated", handlePointUpdate);
    return () => window.removeEventListener("pointUpdated", handlePointUpdate);
  }, [token, isLoggedIn]);

  // Predict 페이지용 팬심 로드
  useEffect(() => {
    const loadUserPoints = async () => {
      if (!isLoggedIn || !location.pathname.startsWith("/prediction")) return;

      try {
        setPointsLoading(true);
        const memberInfo = await getMemberInfo();
        setUserPoints(memberInfo.exp || 0);
      } catch (error) {
        console.error('Error loading user points:', error.message);
        setUserPoints(0);
      } finally {
        setPointsLoading(false);
      }
    };

    loadUserPoints();
  }, [isLoggedIn, location.pathname]);

    // 중고채팅 읽지 않은 메시지 수 조회
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!token || !isLoggedIn) return;

      try {
        const count = await usedItemChatApi.getTotalUnreadCount();
        setTotalUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();

    // 30초마다 갱신
    const interval = setInterval(fetchUnreadCount, 30000);

    // 채팅방 목록 진입 시 즉시 갱신
    const handleChatListViewed = () => {
      fetchUnreadCount();
    };

    window.addEventListener('chatListViewed', handleChatListViewed);

    return () => {
      clearInterval(interval);
      window.removeEventListener('chatListViewed', handleChatListViewed);
    };
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
      location.pathname === "/checkout" ||
      location.pathname.startsWith("/success") ||
      location.pathname.startsWith("/fail"));

  const isPredictPage = location.pathname.startsWith("/prediction");

  const currentLogo = logo;

  return (
    <nav className="nav-bar-top" style={{ backgroundColor: teamColors.bgColor }}>
      <div className="sns-logo" onClick={() => navigate("/")}>
        <img src={currentLogo} alt="Yammy" className="sns-logo-img" />
      </div>

      {isPredictPage ? (
        <div className="header-right">
          {isLoggedIn && (
            <div className="predict-points-display">
              <span className="points-label">보유 팬심:</span>
              <span className="points-value">
                {pointsLoading ? "로딩중..." : `${userPoints.toLocaleString()}팬심`}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="header-right">
          {shouldShowBalanceButton ? (
          <div className="ypay-baseball-wrapper">
            <div className="ypay-info" onClick={goMyPoint}>
              <div className="ypay-logo-circle">⚾</div>
              <span className="ypay-balance">
                {balance !== null
                  ? (() => {
                      const str = format(balance);
                      return str.length > 5 ? `${str.slice(0, 3)}...` : `${str}`;
                    })()
                  : error
                  ? "오류"
                  : "로딩 중..."}
              </span>
            </div>
            <button className="chatlist-btn" onClick={goChatList}>
              채팅방
            </button>
            <div className="header-notification" onClick={goChatList}>
              <span className="bell-icon">🔔</span>
              {totalUnreadCount > 0 && (
                <span className="notification-badge">
                  {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                </span>
              )}
            </div>
            
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
                    e.stopPropagation(); // 버튼 클릭 시 외부 클릭 이벤트 막기
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
              <button className="login-button" onClick={() => navigate("/login")}>
                로그인
              </button>
            )}
          </>
        )}
        </div>
        )}
    </nav>
  );
};

export default NavigationBarTop;
