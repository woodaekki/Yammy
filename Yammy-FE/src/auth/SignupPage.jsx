import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup, sendVerificationCode, verifyEmail } from './api/authApi';
import './styles/auth.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    name: '',
    nickname: '',
    email: '',
    team: '',
    bio: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSendCode = async () => {
    const email = formData.email.trim();

    if (!email || !email.includes('@')) {
      setErrors((prev) => ({ ...prev, email: '올바른 이메일을 입력해주세요' }));
      return;
    }

    setLoading(true);
    setErrors((prev) => ({ ...prev, email: '' }));

    try {
      await sendVerificationCode(email);
      setCodeSent(true);
      setSuccessMessage('인증 코드가 발송되었습니다 (3분간 유효)');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Send code error:', err);
      setErrors((prev) => ({
        ...prev,
        email: err.response?.data?.error || '인증 코드 발송에 실패했습니다',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const email = formData.email.trim();
    const code = verificationCode.trim();

    if (!code || code.length !== 6) {
      setErrors((prev) => ({ ...prev, code: '6자리 인증 코드를 입력해주세요' }));
      return;
    }

    setLoading(true);
    setErrors((prev) => ({ ...prev, code: '' }));

    try {
      await verifyEmail(email, code);
      setEmailVerified(true);
      setSuccessMessage('이메일 인증이 완료되었습니다!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Verify code error:', err);
      setErrors((prev) => ({
        ...prev,
        code: err.response?.data?.error || '인증 코드가 일치하지 않습니다',
      }));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.id.trim()) newErrors.id = '아이디를 입력해주세요';
    if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요';
    if (!formData.nickname.trim()) newErrors.nickname = '닉네임을 입력해주세요';
    if (!formData.email.trim() || !formData.email.includes('@'))
      newErrors.email = '올바른 이메일을 입력해주세요';
    if (!emailVerified) newErrors.email = '이메일 인증을 완료해주세요';
    if (formData.password.length < 8)
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const signupData = {
      id: formData.id.trim(),
      password: formData.password,
      name: formData.name.trim(),
      nickname: formData.nickname.trim(),
      email: formData.email.trim(),
      team: formData.team.trim() || null,
      gameTag: 0,
      bio: formData.bio.trim() || null,
      profileImage: "/nomal.jpg",
    };

    try {
      await signup(signupData);
      alert('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err);
      alert(err.response?.data?.error || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        {/* 헤더 */}
        <div className="auth-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <i className="fas fa-arrow-left"></i>
          </button>
          <h2 className="header-title">회원가입</h2>
          <div className="header-spacer"></div>
        </div>

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit} className="auth-form signup-form">
          <div className="form-group">
            <label htmlFor="id" className="form-label required">
              아이디
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                id="id"
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder="로그인 아이디를 입력하세요"
                className="form-input"
                autoComplete="username"
              />
              <i className="fas fa-id-card input-icon"></i>
            </div>
            {errors.id && <span className="error-text">{errors.id}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label required">
              이름
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="실명을 입력하세요"
                className="form-input"
                autoComplete="name"
              />
              <i className="fas fa-user input-icon"></i>
            </div>
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="nickname" className="form-label required">
              닉네임
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="다른 사용자에게 보여질 이름"
                className="form-input"
              />
              <i className="fas fa-signature input-icon"></i>
            </div>
            {errors.nickname && <span className="error-text">{errors.nickname}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label required">
              이메일
            </label>
            <div className="input-wrapper with-button">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) => {
                  handleChange(e);
                  setCodeSent(false);
                  setEmailVerified(false);
                }}
                placeholder="이메일 주소를 입력하세요"
                className="form-input"
                autoComplete="email"
                disabled={emailVerified}
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={loading || emailVerified}
                className="inline-button"
              >
                {codeSent ? '재발송' : '인증코드'}
              </button>
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
            {successMessage && !errors.email && (
              <span className="success-text">{successMessage}</span>
            )}
          </div>

          {codeSent && !emailVerified && (
            <div className="form-group">
              <label htmlFor="verificationCode" className="form-label required">
                인증 코드
              </label>
              <div className="input-wrapper with-button">
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="6자리 인증 코드"
                  maxLength={6}
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={loading}
                  className="inline-button success"
                >
                  인증확인
                </button>
              </div>
              {errors.code && <span className="error-text">{errors.code}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password" className="form-label required">
              비밀번호
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="8자 이상, 영문+숫자 조합"
                className="form-input"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label required">
              비밀번호 확인
            </label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력하세요"
                className="form-input"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
              >
                <i
                  className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                ></i>
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="team" className="form-label">
              좋아하는 야구팀
            </label>
            <div className="input-wrapper">
              <select
                id="team"
                name="team"
                value={formData.team}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">팀을 선택하세요</option>
                <option value="KIA 타이거즈">KIA 타이거즈</option>
                <option value="삼성 라이온즈">삼성 라이온즈</option>
                <option value="LG 트윈스">LG 트윈스</option>
                <option value="두산 베어스">두산 베어스</option>
                <option value="KT 위즈">KT 위즈</option>
                <option value="SSG 랜더스">SSG 랜더스</option>
                <option value="롯데 자이언츠">롯데 자이언츠</option>
                <option value="한화 이글스">한화 이글스</option>
                <option value="NC 다이노스">NC 다이노스</option>
                <option value="키움 히어로즈">키움 히어로즈</option>
              </select>
              <i className="fas fa-baseball-ball input-icon"></i>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio" className="form-label">
              자기소개
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="간단한 자기소개를 입력하세요"
              className="form-textarea"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                처리 중...
              </>
            ) : (
              '회원가입'
            )}
          </button>
        </form>

        {/* 하단 링크 */}
        <div className="auth-footer">
          <span className="footer-text">이미 계정이 있으신가요?</span>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="link-button"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}
