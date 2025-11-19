import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../stores/authStore';

/**
 * ADMIN 권한이 필요한 페이지를 보호하는 컴포넌트
 * - 로그인 체크
 * - ADMIN 권한 체크
 */
export default function AdminRoute({ children }) {
  const { isLoggedIn, user, initialize } = useAuthStore();

  // 페이지 로드 시 로그인 상태 복원
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 1. 로그인 체크
  if (!isLoggedIn) {
    alert('로그인이 필요합니다.');
    return <Navigate to="/login" replace />;
  }

  // 2. ADMIN 권한 체크
  if (user?.authority !== 'ADMIN') {
    alert('관리자만 접근 가능합니다.');
    return <Navigate to="/cheerup" replace />;
  }

  // 통과!
  return children;
}