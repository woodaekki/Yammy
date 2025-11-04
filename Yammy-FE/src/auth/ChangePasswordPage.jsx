import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from './api/authApi';
import './styles/auth.css';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setError('현재 비밀번호를 입력해주세요.');
      return false;
    }
    if (!formData.newPassword) {
      setError('새 비밀번호를 입력해주세요.');
      return false;
    }
    if (formData.newPassword.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      setError('현재 비밀번호와 새 비밀번호가 같습니다.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      alert('비밀번호가 성공적으로 변경되었습니다.');
      navigate(-1);
    } catch (err) {
      console.error('비밀번호 변경 실패:', err);
      setError(err.response?.data?.error || '비밀번호 변경에 실패했습니다.');
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
          <div className="header-title">비밀번호 변경</div>
          <div className="header-spacer"></div>
        </div>

        {/* 폼 */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-section">
            <h3 className="form-section-title">비밀번호 변경</h3>

            {/* 현재 비밀번호 */}
            <div className="form-group">
              <label className="form-label">현재 비밀번호</label>
              <div className="input-with-icon">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  className="form-input"
                  placeholder="현재 비밀번호를 입력하세요"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="input-icon-button"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* 새 비밀번호 */}
            <div className="form-group">
              <label className="form-label">새 비밀번호</label>
              <div className="input-with-icon">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  className="form-input"
                  placeholder="새 비밀번호 (8자 이상)"
                  value={formData.newPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="input-icon-button"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* 새 비밀번호 확인 */}
            <div className="form-group">
              <label className="form-label">새 비밀번호 확인</label>
              <div className="input-with-icon">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-input"
                  placeholder="새 비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="input-icon-button"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && <div className="error-message">{error}</div>}

            {/* 제출 버튼 */}
            <button
              type="submit"
              className="submit-button primary"
              disabled={loading}
            >
              {loading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
