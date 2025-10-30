import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './api/authApi';
import { getKakaoAuthUrl } from './config/kakaoConfig';
import './styles/auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 이미 로그인된 경우 메인 페이지로 이동
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id || !formData.password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await login(formData);

      // 토큰 및 사용자 정보 저장
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('memberId', response.memberId);
      localStorage.setItem('loginId', response.id);
      localStorage.setItem('nickname', response.nickname);
      localStorage.setItem('authority', response.authority);

      // 메인 페이지로 이동
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.error ||
        '아이디 또는 비밀번호가 올바르지 않습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleKakaoLogin = () => {
    window.location.href = getKakaoAuthUrl();
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        {/* 로고 섹션 */}
        <div className="auth-logo-section">
          <div className="auth-logo-icon">
            <i className="fas fa-trophy"></i>
          </div>
          <h1 className="auth-title">Yammy</h1>
          <p className="auth-subtitle">스포츠 팬들의 소셜 네트워크</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="id" className="form-label">
              아이디
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                id="id"
                name="id"
                value={formData.id}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="아이디를 입력하세요"
                className="form-input"
                autoComplete="username"
              />
              <i className="fas fa-user input-icon"></i>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="비밀번호를 입력하세요"
                className="form-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </button>

          {/* 구분선 */}
          <div className="divider">
            <span>또는</span>
          </div>

          {/* 카카오 로그인 */}
          <button
            type="button"
            onClick={handleKakaoLogin}
            className="btn-kakao"
          >
            <svg className="kakao-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.85 1.92 5.34 4.8 6.72-.21.77-.78 2.89-.9 3.36-.15.57.21.57.45.42.18-.12 2.91-1.95 3.75-2.52.6.09 1.23.12 1.9.12 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
            </svg>
            카카오로 로그인
          </button>
        </form>

        {/* 하단 링크 */}
        <div className="auth-footer">
          <span className="footer-text">아직 계정이 없으신가요?</span>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="link-button"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
