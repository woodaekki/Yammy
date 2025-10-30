import { Navigate } from 'react-router-dom';

/**
 * 로그인이 필요한 페이지를 보호하는 컴포넌트
 * 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
 */
export default function ProtectedRoute({ children }) {
  const accessToken = localStorage.getItem('accessToken');

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // 로그인한 경우 요청한 페이지 표시
  return children;
}
