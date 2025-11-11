import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { getTeamColors, TEAM_COLORS } from '../sns/utils/teamColors';
import { updateMember } from '../auth/api/authApi';
import { getPresignedUrls, completeUpload } from '../useditem/api/photoApi';
import { getTickets } from '../ticket/api/ticketApi';
import { getEtherscanNFTUrl } from '../ticket/api/nftApi';
import './styles/MyPage.css';

// 기본 프로필 이미지 (SVG data URI)
const DEFAULT_PROFILE_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"%3E%3Ccircle cx="75" cy="75" r="75" fill="%23e5e7eb"/%3E%3Cpath d="M75 70c13.8 0 25-11.2 25-25S88.8 20 75 20 50 31.2 50 45s11.2 25 25 25zm0 12.5c-16.7 0-50 8.4-50 25v12.5h100v-12.5c0-16.6-33.3-25-50-25z" fill="%239ca3af"/%3E%3C/svg%3E';

const MyPage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, initialize } = useAuthStore();
  const [teamColors, setTeamColors] = useState(getTeamColors());
  const [formData, setFormData] = useState({
    nickname: '',
    name: '',
    email: '',
    team: '',
    bio: '',
    profileImage: '',
  });
  const [originalTeam, setOriginalTeam] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [nftTickets, setNftTickets] = useState([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const fileInputRef = useRef(null);

  // 팀 변경 이벤트 감지
  useEffect(() => {
    const handleTeamChange = () => {
      setTeamColors(getTeamColors());
    };
    window.addEventListener('teamChanged', handleTeamChange);
    return () => window.removeEventListener('teamChanged', handleTeamChange);
  }, []);

  useEffect(() => {
    initialize();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // localStorage에서 사용자 정보 로드
    const profileImage = localStorage.getItem('profileImage') || '';
    const team = localStorage.getItem('team') || '';

    console.log('로드된 프로필 이미지:', profileImage);
    console.log('로드된 팀:', team);

    setFormData({
      nickname: localStorage.getItem('nickname') || '',
      name: localStorage.getItem('name') || '',
      email: localStorage.getItem('email') || '',
      team: team,
      bio: localStorage.getItem('bio') || '',
      profileImage: profileImage,
    });

    // 프로필 이미지가 없거나 빈 문자열이면 기본 이미지 사용
    setPreviewImage(profileImage && profileImage.trim() !== '' ? profileImage : DEFAULT_PROFILE_IMAGE);
    setOriginalTeam(team);

    // NFT 티켓 목록 로드
    loadNFTTickets();
  }, [isLoggedIn, navigate, initialize]);

  // NFT 티켓 목록 가져오기
  const loadNFTTickets = async () => {
    setLoadingNFTs(true);
    try {
      const tickets = await getTickets();
      // NFT가 발급된 티켓만 필터링
      const nftOnlyTickets = tickets.filter(ticket => ticket.nftMinted === true);
      setNftTickets(nftOnlyTickets);
      console.log('NFT 티켓 목록:', nftOnlyTickets);
    } catch (error) {
      console.error('NFT 티켓 목록 로드 실패:', error);
    } finally {
      setLoadingNFTs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTeamSelect = (teamName) => {
    setFormData((prev) => ({
      ...prev,
      team: teamName,
      bio: `⚾ ${teamName}`, // 팀 변경 시 bio 자동 업데이트
    }));
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 이미지 미리보기
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file);
    }
  };

  const uploadImageToS3 = async (file) => {
    try {
      console.log('S3 업로드 시작:', file.name);

      // 1. Presigned URL 요청
      const presignedData = await getPresignedUrls([file]);
      console.log('Presigned URL 받음:', presignedData);

      const { s3Key, presignedUrl } = presignedData[0];

      // 2. S3에 직접 업로드
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('S3 업로드 실패');
      }

      console.log('S3 업로드 성공');

      // 3. 업로드 완료 알림
      const fileUrl = `https://yammy-project.s3.ap-northeast-2.amazonaws.com/${s3Key}`;
      await completeUpload({
        s3Key,
        fileUrl,
        contentType: file.type,
      });

      console.log('업로드 완료:', fileUrl);
      return fileUrl;
    } catch (error) {
      console.error('S3 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
      return null;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let profileImageUrl = formData.profileImage;

      // 새 이미지가 선택된 경우 S3에 업로드
      if (selectedFile) {
        const uploadedUrl = await uploadImageToS3(selectedFile);
        if (!uploadedUrl) {
          setLoading(false);
          return;
        }
        profileImageUrl = uploadedUrl;
      }

      // 프로필 업데이트 API 호출
      const updateData = {
        nickname: formData.nickname,
        team: formData.team,
        bio: formData.bio || '',
        profileImage: profileImageUrl || '',
      };

      console.log('프로필 업데이트 요청:', updateData);
      const response = await updateMember(updateData);
      console.log('프로필 업데이트 응답:', response);

      // localStorage 업데이트
      localStorage.setItem('nickname', response.nickname || formData.nickname);
      localStorage.setItem('team', response.team || formData.team);
      localStorage.setItem('bio', response.bio || formData.bio);
      localStorage.setItem('profileImage', response.profileImage || profileImageUrl || '');

      alert('프로필이 업데이트되었습니다!');
      setSelectedFile(null);

      // 팀 변경 시 팀 컬러 업데이트
      if (formData.team !== originalTeam) {
        setTeamColors(getTeamColors());
        setOriginalTeam(formData.team);
        // 팀 변경 이벤트 발생
        window.dispatchEvent(new Event('teamChanged'));
      }
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      console.error('에러 상세:', error.response?.data);
      alert(`프로필 업데이트에 실패했습니다: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mypage-container"
      style={{
        '--team-color': teamColors.bgColor,
        '--team-text-color': teamColors.textColor
      }}
    >
      {/* 헤더 */}
      <div className="mypage-header" style={{ backgroundColor: teamColors.bgColor }}>
        <button onClick={() => navigate(-1)} className="back-btn" style={{ color: teamColors.textColor }}>
          ←
        </button>
        <h1 className="header-title" style={{ color: teamColors.textColor }}>마이페이지</h1>
        <div style={{ width: '60px' }}></div> {/* 레이아웃 균형을 위한 빈 공간 */}
      </div>

      {/* 프로필 정보 */}
      <div className="mypage-content">
        <div className="profile-section">
          <div className="profile-avatar-wrapper">
            <div
              className="profile-avatar-container editable"
              onClick={handleImageClick}
            >
              <img
                src={previewImage}
                alt="프로필"
                className="profile-avatar"
                onError={(e) => {
                  console.log('이미지 로드 실패, 기본 이미지로 대체');
                  e.target.src = DEFAULT_PROFILE_IMAGE;
                }}
              />
              <div className="avatar-overlay">
                <i className="fas fa-camera"></i>
                <span>사진 변경</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          <div className="mypage-profile-info">
            <div className="info-group">
              <label className="info-label">닉네임</label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="info-input"
                placeholder="닉네임을 입력하세요"
              />
            </div>

            <div className="info-group">
              <label className="info-label">이름</label>
              <p className="info-value readonly">{formData.name || '없음'}</p>
            </div>

            <div className="info-group">
              <label className="info-label">이메일</label>
              <p className="info-value readonly">{formData.email || '없음'}</p>
            </div>

            <div className="info-group">
              <label className="info-label">좋아하는 야구팀</label>
              <div className="team-toggle-container">
                {['LG 트윈스', '한화 이글스', 'SSG 랜더스', '삼성 라이온즈', 'NC 다이노스',
                  'KT 위즈', '롯데 자이언츠', 'KIA 타이거즈', '두산 베어스', '키움 히어로즈']
                  .map((teamName) => (
                    <button
                      key={teamName}
                      className={`team-toggle-btn ${formData.team === teamName ? 'active' : ''}`}
                      style={{
                        backgroundColor: formData.team === teamName ? TEAM_COLORS[teamName].bgColor : '#f3f4f6',
                        color: formData.team === teamName ? TEAM_COLORS[teamName].textColor : '#374151',
                      }}
                      onClick={() => handleTeamSelect(teamName)}
                    >
                      {teamName}
                    </button>
                  ))}
              </div>
            </div>

            <div className="info-group">
              <label className="info-label">자기소개</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="info-textarea"
                placeholder="자기소개를 입력하세요"
                rows={4}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="save-btn"
        >
          {loading ? '저장 중...' : '저장하기'}
        </button>

        {/* 내 NFT 목록 */}
        <div className="nft-list-section">
          <h2 className="nft-list-title">내 NFT 티켓</h2>
          {loadingNFTs ? (
            <p className="nft-loading">NFT 목록을 불러오는 중...</p>
          ) : nftTickets.length === 0 ? (
            <p className="nft-empty">발급된 NFT 티켓이 없습니다.</p>
          ) : (
            <div className="nft-grid">
              {nftTickets.map((ticket) => (
                <div key={ticket.id} className="nft-card">
                  <div className="nft-card-header">
                    <h3>{ticket.game}</h3>
                    <span className="nft-badge">NFT</span>
                  </div>
                  <div className="nft-card-body">
                    <div className="nft-info-row">
                      <span className="nft-label">날짜</span>
                      <span className="nft-value">{ticket.date}</span>
                    </div>
                    <div className="nft-info-row">
                      <span className="nft-label">장소</span>
                      <span className="nft-value">{ticket.location}</span>
                    </div>
                    <div className="nft-info-row">
                      <span className="nft-label">좌석</span>
                      <span className="nft-value">{ticket.seat}</span>
                    </div>
                    {ticket.nftTokenId && ticket.nftTokenId > 0 && (
                      <div className="nft-info-row">
                        <span className="nft-label">Token ID</span>
                        <span className="nft-value">#{ticket.nftTokenId}</span>
                      </div>
                    )}
                  </div>
                  {ticket.nftTokenId && ticket.nftTokenId > 0 ? (
                    <div className="nft-card-footer">
                      <a
                        href={getEtherscanNFTUrl(ticket.nftTokenId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nft-etherscan-link"
                      >
                        Etherscan에서 보기 →
                      </a>
                    </div>
                  ) : (
                    <div className="nft-card-footer">
                      <p style={{ textAlign: 'center', color: '#6b7280', margin: 0, fontSize: '13px' }}>
                        NFT 발급 처리 중 또는 Token ID를 찾을 수 없습니다
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
