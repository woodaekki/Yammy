import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import "./NavigationBar.css";

const NavigationBarTop = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nickname, setNickname] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const userNickname = localStorage.getItem('nickname');
    if (accessToken) {
      setIsLoggedIn(true);
      setNickname(userNickname || '사용자');
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      localStorage.clear();
      setIsLoggedIn(false);
      setNickname('');
      setShowUserMenu(false);
      navigate('/login');
    }
  };

  return (
    <nav className="nav-bar-top">
      <h1 className="sns-logo" onClick={() => navigate('/')}>Yammy</h1>
      <div className="header-right">
        {isLoggedIn ? (
          <div className="user-menu-wrapper">
            <button
              className="user-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <i className="fas fa-user-circle"></i>
              <span className="user-nickname">{nickname}</span>
              <i className={`fas fa-chevron-down ${showUserMenu ? 'rotate' : ''}`}></i>
            </button>
            {showUserMenu && (
              <div className="user-dropdown">
                <button onClick={() => navigate(`/user/${nickname}`)}>
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
