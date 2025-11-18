import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup, sendVerificationCode, verifyEmail, login, updateMember } from './api/authApi';
import { getPresignedUrls, completeUpload } from '../useditem/api/photoApi';
import { TEAM_LOGOS } from '../utils/teamLogos';
import { TEAM_COLORS } from '../sns/utils/teamColors';
import imageCompression from 'browser-image-compression';
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
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

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

  // 실제 이미지 파일인지 검증하는 함수
  const validateImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const arr = new Uint8Array(reader.result).subarray(0, 4);
        let header = '';
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }

        // 이미지 파일 시그니처 확인
        const isValidImage =
          header.startsWith('89504e47') || // PNG
          header.startsWith('ffd8ff') ||   // JPEG
          header.startsWith('47494638') || // GIF
          header.startsWith('424d') ||     // BMP
          header.startsWith('49492a00') || // TIFF
          header.startsWith('4d4d002a');   // TIFF

        resolve(isValidImage);
      };
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  };

  // 이미지 압축 함수 (GIF 예외 처리 포함)
  const compressImage = async (file) => {
    try {
      // GIF는 압축하지 않음 (용량이 큰 경우만 압축)
      if (file.type === 'image/gif' && file.size <= 10 * 1024 * 1024) {
        return file;
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressed = await imageCompression(file, options);
      return new File([compressed], file.name, { type: compressed.type });
    } catch (error) {
      console.error('이미지 압축 실패:', error);
      return file;
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, profileImage: '이미지 파일만 업로드 가능합니다' }));
      return;
    }

    // 실제 이미지 파일인지 검증
    const isValidImage = await validateImageFile(file);
    if (!isValidImage) {
      setErrors((prev) => ({ ...prev, profileImage: '유효하지 않은 이미지 파일입니다' }));
      return;
    }

    // 이미지 압축
    const compressedFile = await compressImage(file);

    // 압축 후 파일 크기 체크 (5MB)
    if (compressedFile.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, profileImage: '이미지 크기는 5MB 이하여야 합니다' }));
      return;
    }

    setProfileImageFile(compressedFile);
    setErrors((prev) => ({ ...prev, profileImage: '' }));

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(compressedFile);
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
    if (!formData.team) newErrors.team = '좋아하는 팀을 선택해주세요';
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
      team: formData.team,
      gameTag: 0,
      bio: formData.bio.trim() || "",
      profileImage: "/nomal.jpg",
    };

    try {
      // 1. 회원가입
      await signup(signupData);

      // 2. 프로필 이미지가 있으면 업로드
      if (profileImageFile) {
        try {
          // 로그인하여 토큰 얻기
          const loginResult = await login({
            id: formData.id.trim(),
            password: formData.password,
          });

          // 로그인 성공 시 토큰 저장
          if (loginResult.accessToken && loginResult.refreshToken) {
            localStorage.setItem('accessToken', loginResult.accessToken);
            localStorage.setItem('refreshToken', loginResult.refreshToken);

            // Presigned URL 요청 (profile 폴더에 저장)
            const presignedData = await getPresignedUrls([profileImageFile], 'profile');
            const { presignedUrl, s3Key } = presignedData[0];

            // S3에 직접 업로드
            await fetch(presignedUrl, {
              method: 'PUT',
              body: profileImageFile,
              headers: {
                'Content-Type': profileImageFile.type,
              },
            });

            // 업로드 완료 및 Photo DB 저장
            const photoResult = await completeUpload({
              s3Key: s3Key,
              fileUrl: presignedUrl.split('?')[0],
              contentType: profileImageFile.type,
            });

            // 프로필 이미지 URL 업데이트
            await updateMember({
              profileImage: photoResult.fileUrl,
            });

            // 토큰 삭제 (다시 로그인 페이지로 이동)
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        } catch (uploadErr) {
          console.error('Profile image upload error:', uploadErr);
          // 이미지 업로드 실패해도 회원가입은 성공으로 처리
        }
      }

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
                maxLength={20}
              />
              <i className="fas fa-id-card input-icon"></i>
            </div>
            <span style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
              {formData.id.length}/20자
            </span>
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
                maxLength={20}
              />
              <i className="fas fa-user input-icon"></i>
            </div>
            <span style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
              {formData.name.length}/20자
            </span>
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
                maxLength={20}
              />
              <i className="fas fa-signature input-icon"></i>
            </div>
            <span style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
              {formData.nickname.length}/20자
            </span>
            {errors.nickname && <span className="error-text">{errors.nickname}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="profileImage" className="form-label">
              프로필 이미지
            </label>
            <div className="profile-image-upload">
              {profileImagePreview ? (
                <label htmlFor="profileImage" className="image-preview-container clickable">
                  <img
                    src={profileImagePreview}
                    alt="프로필 미리보기"
                    className="profile-preview"
                  />
                  <div className="image-change-overlay">
                    <i className="fas fa-camera"></i>
                    <span>이미지 변경</span>
                  </div>
                </label>
              ) : (
                <label htmlFor="profileImage" className="image-upload-label">
                  <i className="fas fa-camera"></i>
                  <span>프로필 이미지 선택</span>
                </label>
              )}
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                className="image-input"
                style={{ display: 'none' }}
              />
            </div>
            {errors.profileImage && (
              <span className="error-text">{errors.profileImage}</span>
            )}
            <span className="help-text">최대 5MB, JPG/PNG 형식 (클릭하여 변경)</span>
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
                maxLength={50}
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
                maxLength={30}
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
                maxLength={30}
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
            <label htmlFor="team" className="form-label required">
              좋아하는 야구팀
            </label>
            <div className="team-toggle-container">
              {['LG 트윈스', '한화 이글스', 'SSG 랜더스', '삼성 라이온즈', 'NC 다이노스',
                'KT 위즈', '롯데 자이언츠', 'KIA 타이거즈', '두산 베어스', '키움 히어로즈']
                .map((teamName) => (
                  <button
                    key={teamName}
                    type="button"
                    className={`team-toggle-btn ${formData.team === teamName ? 'active' : ''}`}
                    style={{
                      backgroundColor: formData.team === teamName ? TEAM_COLORS[teamName]?.bgColor : '#f3f4f6',
                      color: formData.team === teamName ? TEAM_COLORS[teamName]?.textColor : '#374151',
                    }}
                    onClick={() => setFormData({ ...formData, team: teamName })}
                  >
                    <img
                      src={TEAM_LOGOS[teamName]}
                      alt={teamName}
                      className="team-logo-icon"
                    />
                    {teamName}
                  </button>
                ))}
            </div>
            {errors.team && <span className="error-text">{errors.team}</span>}
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
              maxLength={200}
            />
            <span style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
              {formData.bio.length}/200자
            </span>
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
