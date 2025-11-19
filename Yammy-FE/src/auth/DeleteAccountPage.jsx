import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteMember } from './api/authApi';
import useAuthStore from '../stores/authStore';
import './styles/auth.css';

export default function DeleteAccountPage() {
  const navigate = useNavigate();
  const { logOut, user } = useAuthStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!confirmChecked) {
      setError('회원탈퇴에 동의해주세요.');
      return;
    }

    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    const confirmed = window.confirm(
      '정말로 탈퇴하시겠습니까?\n\n탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.'
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await deleteMember();

      alert('회원탈퇴가 완료되었습니다.');
      logOut();
      navigate('/login');
    } catch (err) {
      console.error('회원탈퇴 실패:', err);
      setError(err.response?.data?.error || '회원탈퇴에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        {/* 헤더 */}
        <div className="auth-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ←
          </button>
          <div className="header-title">회원탈퇴</div>
          <div className="header-spacer"></div>
        </div>

        {/* 경고 섹션 */}
        <div className="warning-section">
          <div className="warning-icon">⚠️</div>
          <h3 className="warning-title">회원탈퇴 전 확인해주세요</h3>
          <ul className="warning-list">
            <li>탈퇴 시 모든 개인정보가 삭제됩니다.</li>
            <li>보유 중인 포인트는 모두 소멸됩니다.</li>
            <li>작성한 게시글과 댓글은 삭제되지 않습니다.</li>
            <li>탈퇴 후 같은 아이디로 재가입할 수 없습니다.</li>
            <li>삭제된 정보는 복구할 수 없습니다.</li>
          </ul>
        </div>

        {/* 폼 */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-section">
            {/* 사용자 정보 확인 */}
            {user && (
              <div className="user-info-box">
                <div className="info-row">
                  <span className="info-label">아이디:</span>
                  <span className="info-value">{user.loginId}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">닉네임:</span>
                  <span className="info-value">{user.nickname}</span>
                </div>
              </div>
            )}

            {/* 비밀번호 확인 */}
            <div className="form-group">
              <label className="form-label">비밀번호 확인</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="input-icon-button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* 확인 체크박스 */}
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => {
                    setConfirmChecked(e.target.checked);
                    setError('');
                  }}
                  disabled={loading}
                />
                <span>위 내용을 모두 확인했으며, 회원탈퇴에 동의합니다.</span>
              </label>
            </div>

            {/* 에러 메시지 */}
            {error && <div className="error-message">{error}</div>}

            {/* 제출 버튼 */}
            <button
              type="submit"
              className="submit-button danger"
              disabled={loading || !confirmChecked}
            >
              {loading ? '탈퇴 처리 중...' : '회원탈퇴'}
            </button>

            <button
              type="button"
              className="submit-button secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
