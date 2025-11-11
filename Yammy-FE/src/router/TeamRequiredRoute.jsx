import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

/**
 * 팀 선택이 필요한 페이지를 보호하는 컴포넌트
 * 팀을 선택하지 않은 사용자는 마이페이지로 리다이렉트
 */
export default function TeamRequiredRoute({ children }) {
  const navigate = useNavigate();
  const hasAlerted = useRef(false);

  // 렌더링 시점에 바로 체크
  const team = localStorage.getItem('team');

  useEffect(() => {
    if (!team && !hasAlerted.current) {
      hasAlerted.current = true;
      alert('티켓을 발급하려면 먼저 마이페이지에서 좋아하는 팀을 선택해주세요.');
      navigate('/mypage', { replace: true });
    }
  }, [team, navigate]);

  // 팀이 없는 경우 아무것도 렌더링하지 않음
  if (!team) {
    return null;
  }

  // 팀이 있는 경우 요청한 페이지 표시
  return children;
}
