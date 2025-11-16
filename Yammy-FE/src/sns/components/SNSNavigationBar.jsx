import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaUser, FaChevronDown, FaCog, FaSignOutAlt } from "react-icons/fa";
import useAuthStore from "../../stores/authStore";
import { getTeamColors } from "../utils/teamColors";
import logo from "../../assets/images/logo.png";
import "../../shared/components/NavigationBar.css";

const SNSNavigationBar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logOut, initialize, syncFromLocalStorage } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [teamColors, setTeamColors] = useState(getTeamColors());
  const dropdownRef = useRef(null);
  const currentUserId = JSON.parse(localStorage.getItem('memberId') || 'null');

  useEffect(() => {
    initialize();
  }, [initialize]);

  // localStorage 변화 감지
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (["profileImage", "nickname", "team", "bio"].includes(e.key)) {
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

  const handleLogout = () => {
    setShowUserMenu(false);
    if (window.confirm("로그아웃 하시겠습니까?")) {
      logOut();
      navigate("/login");
    }
  };

  return (
    <nav className="nav-bar-top" style={{ backgroundColor: teamColors.bgColor }}>
      <div className="sns-logo" onClick={() => navigate("/")}>
        <img src={logo} alt="Yammy" className="sns-logo-img" />
      </div>

      <div className="header-right">
        {isLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* 유저 검색 버튼 */}
            <button
              className="sns-nav-icon-btn"
              onClick={() => navigate("/users/search")}
              title="유저 찾기"
              style={{ color: 'white', fontSize: '1.3rem' }}
            >
              <FaSearch />
            </button>

            {/* 내 프로필 버튼 */}
            <button
              className="sns-nav-icon-btn"
              onClick={() => navigate(`/user/${currentUserId}`)}
              title="내 프로필"
              style={{ color: 'white', fontSize: '1.3rem' }}
            >
              <FaUser />
            </button>

            {/* 프로필 메뉴 */}
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
                <FaChevronDown
                  className={showUserMenu ? "rotate" : ""}
                />
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <button onClick={() => navigate("/mypage")}>
                    <FaCog /> 내 정보 수정
                  </button>
                  <button onClick={handleLogout}>
                    <FaSignOutAlt /> 로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button className="login-button" onClick={() => navigate("/login")}>
            로그인
          </button>
        )}
      </div>
    </nav>
  );
};

export default SNSNavigationBar;
