import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginWithKakao } from './api/kakaoAuthApi';
import useAuthStore from '../stores/authStore';
import './styles/auth.css';

export default function KakaoCallbackPage() {
  const navigate = useNavigate();
  const { logIn } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleKakaoCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // 중복 실행 방지
      if (hasProcessed.current || !code) return;
      hasProcessed.current = true;

      // 사용자가 카카오 로그인을 취소한 경우
      if (errorParam) {
        setError(errorDescription || '카카오 로그인을 취소했습니다.');
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // 인증 코드가 없는 경우
      if (!code) {
        setError('카카오 인증 코드를 받을 수 없습니다.');
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        // 백엔드로 인증 코드 전송
        const response = await loginWithKakao(code);

        // AuthStore를 통해 로그인 처리 (localStorage 저장 + 상태 업데이트)
        logIn(response);

        // 메인 페이지로 리다이렉트
        navigate('/sns', { replace: true });
      } catch (err) {
        let errorMessage;

        // 백엔드에서 전달한 에러 메시지 우선 사용
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        // 400 Bad Request - 탈퇴한 회원 또는 비즈니스 로직 에러
        else if (err.response?.status === 400) {
          errorMessage = '로그인에 실패했습니다. 탈퇴한 회원이거나 잘못된 요청입니다.';
        }
        // 403 Forbidden - 접근 거부
        else if (err.response?.status === 403) {
          errorMessage = '접근이 거부되었습니다. 백엔드 서버를 확인해주세요.';
        }
        // 500 Internal Server Error
        else if (err.response?.status === 500) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
        // 기타 에러
        else if (err.message) {
          errorMessage = err.message;
        }
        else {
          errorMessage = '카카오 로그인 처리 중 오류가 발생했습니다.';
        }

        setError(errorMessage);
        setLoading(false);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleKakaoCallback();
  }, [searchParams, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-logo-section">
          <div className="auth-logo-icon">
            <i className="fas fa-trophy"></i>
          </div>
          <h2 className="auth-title">Yammy</h2>
        </div>

        <div style={{ textAlign: 'center', padding: '2rem' }}>
          {loading ? (
            <>
              <div className="spinner" style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', borderWidth: '4px' }}></div>
              <p style={{ color: '#6b7280' }}>카카오 로그인 처리 중...</p>
            </>
          ) : (
            <>
              <i className="fas fa-exclamation-circle" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }}></i>
              <p style={{ color: '#ef4444', fontSize: '1rem' }}>{error}</p>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>로그인 페이지로 이동합니다...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
