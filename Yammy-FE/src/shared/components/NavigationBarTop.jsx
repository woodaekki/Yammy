import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { getMyPoint } from "../../payment/api/pointAPI";
import { getTeamColors } from "../../sns/utils/teamColors";
import logo from "../../assets/images/logo.png";
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

  // Add the format function
  const format = (num) => num.toLocaleString(); 

  // Initialize and restore login state from localStorage
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
    
    if (token && isLoggedIn) {
        fetchData();  
    }
    
  }, [token, isLoggedIn]);  

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

  const goMyPoint = () => {
    navigate("/mypoint");
  };

  // 잔액 표시 조건: 로그인 상태이고, /useditem 또는 /mypoint 경로일 때
  const shouldShowBalanceButton = isLoggedIn && (
    location.pathname === "/useditem" || location.pathname === "/mypoint"
  );
  
  return (
    <nav className="nav-bar-top" style={{ backgroundColor: teamColors.bgColor }}>
      <div className="sns-logo" onClick={() => navigate('/')}>
        <img src={logo} alt="Yammy" className="sns-logo-img" />
      </div>
      <div className="header-right">
        {shouldShowBalanceButton ? (
          <div className="npay-point-wrapper">
            <button
              className="npay-point-button"
              onClick={goMyPoint}
            >
              <span className="npay-point-balance">
                {balance !== null ? format(balance) : (error ? '오류' : '로딩 중...')}
              </span>
              <span className="npay-point-symbol">Y</span>
            </button>
          </div>
        ) : (
          // Default user menu or login button
          <>
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
          </>
        )}
      </div>
    </nav>
  );
};

export default NavigationBarTop;