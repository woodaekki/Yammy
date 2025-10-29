import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/UserProfile.css';

const UserProfile = () => {
    const navigate = useNavigate();
    const { userId } = useParams();

    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(1234);
    const [activeTab, setActiveTab] = useState('posts');

    const profileData = {
        name: '김민지',
        username: '@minji_sports',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
        postsCount: 247,
        bio: '⚽ 축구 매니아 | 🏀 농구 덕후\n토트넘 홋스퍼 평생 팬 💙\n스포츠로 세상을 더 재미있게! 🌟',
        website: 'minji-sports.blog.com',
        isVerified: true
    };

    const posts = [
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/a5b406f301-37083bbcc1c06467dcf6.png',
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/85b2b070c1-28e2b788ecdc2924a6e3.png',
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/b33bfab4c4-1a091756423610f3aee1.png',
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/df6b0b4f96-0732a36de11f87a5dcc8.png',
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/77f6d9739d-f182905caad0fabb7fd6.png',
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/6c665aac4f-fcd6f0f094dcbd798a24.png',
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/605a1a0214-3b37d4a3ce0a01a12bf0.png',
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/60eef876e5-926cefad2da473427350.png',
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/44559eba60-7984ebce55fcc8cd9e8f.png'
    ];

    const nfts = [
        { id: '001', name: 'Victory Moment', price: '0.5 KLAY', gradient: 'from-purple-400 to-pink-400' },
        { id: '002', name: 'Team Spirit', price: '0.8 KLAY', gradient: 'from-blue-400 to-cyan-400' }
    ];

    const likedPosts = [
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/a2fa7a711b-d8975a25ef17404f3ccf.png',
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/fd660c3908-dac73f8b406ae39cf892.png',
        'https://storage.googleapis.com/uxpilot-auth.appspot.com/219a63a62d-09eddf87acb25f102ffc.png'
    ];

    const [showOptions, setShowOptions] = useState(false);

    const goBack = () => {
        navigate(-1);
    };

    const toggleFollow = () => {
        if (isFollowing) {
            setFollowersCount(followersCount - 1);
        } else {
            setFollowersCount(followersCount + 1);
        }
        setIsFollowing(!isFollowing);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="user-profile">
            {/* 헤더 */}
            <div className="profile-header">
                <button onClick={goBack} className="back-btn">←</button>
                <h1 className="header-title">프로필</h1>
                <button onClick={() => setShowOptions(true)} className="options-btn">⋮</button>
            </div>

            {/* 프로필 정보 */}
            <div className="profile-info-section">
                <div className="profile-main">
                    <div className="avatar-wrapper">
                        <img src={profileData.avatar} alt={profileData.name} className="profile-avatar" />
                        {profileData.isVerified && (
                            <div className="verified-badge">✓</div>
                        )}
                    </div>

                    <div className="profile-details">
                        <h2 className="profile-name">{profileData.name}</h2>
                        <p className="profile-username">{profileData.username}</p>

                        <div className="profile-stats">
                            <div className="stat-item">
                                <div className="stat-number">{profileData.postsCount}</div>
                                <div className="stat-label">게시물</div>
                            </div>
                            <button className="stat-item" onClick={() => {}}>
                                <div className="stat-number">{followersCount.toLocaleString()}</div>
                                <div className="stat-label">팔로워</div>
                            </button>
                            <button className="stat-item" onClick={() => {}}>
                                <div className="stat-number">567</div>
                                <div className="stat-label">팔로잉</div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 소개 */}
                <div className="bio-section">
                    <p className="bio-text">{profileData.bio}</p>
                    <div className="website-link">
                        <span className="link-icon">🔗</span>
                        <a href={`https://${profileData.website}`} className="link-text">
                            {profileData.website}
                        </a>
                    </div>
                </div>

                {/* 액션 버튼 */}
                <div className="action-buttons">
                    <button
                        className={`follow-button ${isFollowing ? 'following' : ''}`}
                        onClick={toggleFollow}
                    >
                        {isFollowing ? '팔로우 취소' : '팔로우'}
                    </button>
                    <button className="message-button">메시지</button>
                    <button className="share-button">📤</button>
                </div>
            </div>

            {/* 탭 */}
            <div className="tabs-section">
                <button
                    className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => handleTabChange('posts')}
                >
                    📱 게시물
                </button>
                <button
                    className={`tab-button ${activeTab === 'nfts' ? 'active' : ''}`}
                    onClick={() => handleTabChange('nfts')}
                >
                    💎 NFT
                </button>
                <button
                    className={`tab-button ${activeTab === 'liked' ? 'active' : ''}`}
                    onClick={() => handleTabChange('liked')}
                >
                    ❤️ 좋아요
                </button>
            </div>

            {/* 컨텐츠 */}
            <div className="content-section">
                {activeTab === 'posts' && (
                    <div className="posts-grid">
                        {posts.map((post, index) => (
                            <div key={index} className="grid-item">
                                <img src={post} alt={`게시물 ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'nfts' && (
                    <div className="nfts-grid">
                        {nfts.map((nft) => (
                            <div key={nft.id} className={`nft-card bg-gradient-to-br ${nft.gradient}`}>
                                <div className="nft-id">#{nft.id}</div>
                                <div className="nft-info">
                                    <div className="nft-name">{nft.name}</div>
                                    <div className="nft-price">{nft.price}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'liked' && (
                    <div className="posts-grid">
                        {likedPosts.map((post, index) => (
                            <div key={index} className="grid-item">
                                <img src={post} alt={`좋아요 ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 옵션 모달 */}
            {showOptions && (
                <div className="options-modal" onClick={() => setShowOptions(false)}>
                    <div className="options-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-handle"></div>
                        <button className="option-item">
                            <span>📤</span> 프로필 공유
                        </button>
                        <button className="option-item">
                            <span>🔗</span> 링크 복사
                        </button>
                        <button className="option-item danger">
                            <span>🚩</span> 신고
                        </button>
                        <button className="option-item" onClick={() => setShowOptions(false)}>
                            <span>✖️</span> 취소
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
