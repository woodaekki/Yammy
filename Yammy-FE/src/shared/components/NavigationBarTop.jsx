import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { getTeamColors } from "../../sns/utils/teamColors";
import logo from "../../assets/images/logo.png";
import "./NavigationBar.css";

const NavigationBarTop = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logOut, initialize } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [teamColors] = useState(getTeamColors());

  // 초기화: localStorage에서 로그인 상태 복원
  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleLogout = () => {
    setShowUserMenu(false);
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logOut();
      navigate('/login');
    }
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate('/mypage');
  };

  return (
    <nav className="nav-bar-top" style={{ backgroundColor: teamColors.bgColor }}>
      <div className="sns-logo" onClick={() => navigate('/')}>
        <img src={logo} alt="Yammy" className="sns-logo-img" />
      </div>
      <div className="header-right">
        {isLoggedIn ? (
          <div className="user-menu-wrapper">
            <button
              className="user-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <i className="fas fa-user-circle"></i>
              <span className="user-nickname">{user?.nickname || '사용자'}</span>
              <i className={`fas fa-chevron-down ${showUserMenu ? 'rotate' : ''}`}></i>
            </button>
            {showUserMenu && (
              <div className="user-dropdown">
                <button onClick={handleProfileClick}>
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
            onClick={() => navigate('/login')}
          >
            로그인
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavigationBarTop;
