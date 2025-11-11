import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserPosts, getFollowStatus, followUser, unfollowUser } from '../api/snsApi';
import { getTickets, getTicketsByUserId } from '../../ticket/api/ticketApi';
import FollowListModal from './FollowListModal';
import TicketCard from '../../ticket/components/TicketCard';
import { getTeamColors } from '../utils/teamColors';
import '../styles/UserProfile.css';

// 기본 프로필 이미지
const DEFAULT_PROFILE_IMAGE = '/nomal.jpg';

const UserProfile = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const currentUser = {
                            nickname: localStorage.getItem('nickname'),
                            team: localStorage.getItem('team'),
                            profileImage: localStorage.getItem('profileImage'),
                            bio: localStorage.getItem('bio')
                        };
    const [profileData, setProfileData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [activeTab, setActiveTab] = useState('posts');
    const [showOptions, setShowOptions] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [ticketsLoading, setTicketsLoading] = useState(false);
    const [showFollowModal, setShowFollowModal] = useState(false);
    const [followModalTab, setFollowModalTab] = useState('followers');
    const [teamColors, setTeamColors] = useState(getTeamColors());
    const currentMemberId = localStorage.getItem('memberId');
    const isOwnProfile = userId === currentMemberId;

    // 프로필 데이터 로드
    useEffect(() => {
        loadProfile();
        loadFollowStatus();
    }, [userId]);

    // 팀 컬러 업데이트
    useEffect(() => {
        setTeamColors(getTeamColors());
    }, []);

    // 티켓 탭 활성화 시 티켓 로드
    useEffect(() => {
        if (activeTab === 'tickets') {
            loadTickets();
        }
    }, [activeTab, userId]);

    const loadProfile = async () => {
        setIsLoading(true);
        try {
            // 사용자의 게시글 목록 가져오기
            const response = await getUserPosts(userId);
            const userPosts = response.posts || [];

            setPosts(userPosts);

            // 첫 번째 게시글에서 사용자 정보 추출 (모든 게시글의 작성자 정보가 동일)
            if (userPosts.length > 0) {
                const firstPost = userPosts[0];
                setProfileData({
                    name: firstPost.nickname,
                    username: `@${firstPost.nickname}`,
                    avatar: firstPost.profileImage || DEFAULT_PROFILE_IMAGE,
                    postsCount: userPosts.length,
                    team: firstPost.team,
                    bio: firstPost.bio || '',
                });
            } else {
                // 게시글이 없을 경우 localStorage 데이터 사용
                setProfileData({
                    name: currentUser.nickname || '사용자',
                    username: `@${currentUser.nickname || 'user'}`,
                    avatar: currentUser.profileImage || DEFAULT_PROFILE_IMAGE,
                    postsCount: 0,
                    team: currentUser.team || '',
                    bio: currentUser.bio || '',
                });
            }
        } catch (error) {
            console.error('프로필 로드 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadFollowStatus = async () => {
        try {
            const status = await getFollowStatus(userId);
            console.log('팔로우 상태 응답:', status);
            setIsFollowing(status.following || false);
            setFollowersCount(status.followerCount || 0);
            setFollowingCount(status.followingCount || 0);
        } catch (error) {
            console.error('팔로우 상태 로드 실패:', error);
        }
    };

    const loadTickets = async () => {
        setTicketsLoading(true);
        try {
            let response;
            if (isOwnProfile) {
                // 본인 프로필일 경우 내 티켓 조회
                response = await getTickets();
            } else {
                // 다른 사용자 프로필일 경우 해당 사용자의 티켓 조회
                response = await getTicketsByUserId(userId);
            }
            setTickets(response || []);
        } catch (error) {
            console.error('티켓 목록 로드 실패:', error);
            setTickets([]);
        } finally {
            setTicketsLoading(false);
        }
    };

    const goBack = () => {
        navigate(-1);
    };

    const toggleFollow = async () => {
        try {
            if (isFollowing) {
                await unfollowUser(userId);
                setFollowersCount(followersCount - 1);
            } else {
                await followUser(userId);
                setFollowersCount(followersCount + 1);
            }
            setIsFollowing(!isFollowing);
            // 팔로우 상태 다시 로드
            await loadFollowStatus();
        } catch (error) {
            console.error('팔로우 토글 실패:', error);
            alert('팔로우 처리에 실패했습니다.');
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    if (isLoading || !profileData) {
        return (
            <div className="user-profile">
                <div className="profile-header">
                    <button onClick={goBack} className="back-btn">←</button>
                    <h1 className="header-title">프로필</h1>
                </div>
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                    로딩 중...
                </div>
            </div>
        );
    }

    return (
        <div
            className="user-profile"
            style={{
                '--team-color': teamColors.bgColor,
                '--team-text-color': teamColors.textColor
            }}
        >
            {/* 헤더 */}
            <div className="profile-header" style={{ backgroundColor: teamColors.bgColor }}>
                <button onClick={goBack} className="back-btn" style={{ color: teamColors.textColor }}>←</button>
                <h1 className="header-title" style={{ color: teamColors.textColor }}>프로필</h1>
                <button onClick={() => setShowOptions(true)} className="options-btn" style={{ color: teamColors.textColor }}>⋮</button>
            </div>

            {/* 프로필 정보 */}
            <div className="profile-info-section">
                <div className="profile-top">
                    <div className="avatar-wrapper">
                        <img
                            src={profileData.avatar || currentUser.profileImage || DEFAULT_PROFILE_IMAGE}
                            alt={profileData.name || currentUser.nickname || '사용자'}
                            className="profile-avatar"
                            onError={(e) => {
                                e.target.src = DEFAULT_PROFILE_IMAGE;
                            }}
                        />
                    </div>
                    <div className="profile-info">
                        <h2 className="profile-name">
                            {profileData.name || currentUser.nickname || '사용자'}
                        </h2>
                        <div className="bio-container">
                            {(profileData.team || currentUser.team) && (
                                <p className="bio-text">
                                    ⚾ {profileData.team || currentUser.team}
                                </p>
                            )}
                            {(profileData.bio || currentUser.bio) && (
                                <p className="bio-text">
                                    {profileData.bio || currentUser.bio}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 게시물/팔로워/팔로잉 통계 */}
                <div className="profile-stats">
                    <div className="stat-item">
                        <div className="stat-label">게시글</div>
                        <div className="stat-number">{profileData.postsCount}</div>
                    </div>
                    <button
                        className="stat-item"
                        onClick={() => {
                            setFollowModalTab('followers');
                            setShowFollowModal(true);
                        }}
                    >
                        <div className="stat-label">팔로워</div>
                        <div className="stat-number">{followersCount.toLocaleString()}</div>
                    </button>
                    <button
                        className="stat-item"
                        onClick={() => {
                            setFollowModalTab('following');
                            setShowFollowModal(true);
                        }}
                    >
                        <div className="stat-label">팔로잉</div>
                        <div className="stat-number">{followingCount.toLocaleString()}</div>
                    </button>
                </div>

                {/* 액션 버튼 */}
                {!isOwnProfile && (
                    <div className="action-buttons">
                        <button
                            className={`follow-button ${isFollowing ? 'following' : ''}`}
                            onClick={toggleFollow}
                        >
                            {isFollowing ? '언팔로우' : '팔로우'}
                        </button>
                    </div>
                )}
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
                    className={`tab-button ${activeTab === 'tickets' ? 'active' : ''}`}
                    onClick={() => handleTabChange('tickets')}
                >
                    🎫 발급받은 티켓
                </button>
            </div>

            {/* 컨텐츠 */}
            <div className="content-section">
                {activeTab === 'posts' && (
                    <div className="posts-grid">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="grid-item"
                                    onClick={() => navigate(`/post/${post.id}/comments`)}
                                >
                                    <img
                                        src={post.imageUrls[0]}
                                        alt={`게시물 ${post.id}`}
                                    />
                                </div>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1 / -1', padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                                아직 게시물이 없습니다.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'tickets' && (
                    <div className="tickets-section">
                        {ticketsLoading ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                                티켓을 불러오는 중...
                            </div>
                        ) : tickets.length === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                                발급받은 티켓이 없습니다.
                            </div>
                        ) : (
                            <div className="tickets-grid">
                                {tickets.map(ticket => (
                                    <TicketCard
                                        key={ticket.id || ticket.ticketId}
                                        ticket={ticket}
                                        onNftMinted={loadTickets}
                                    />
                                ))}
                            </div>
                        )}
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

            {/* 팔로우 리스트 모달 */}
            <FollowListModal
                isOpen={showFollowModal}
                onClose={() => {
                    setShowFollowModal(false);
                    loadFollowStatus(); // 모달 닫힐 때 팔로우 수 새로고침
                }}
                userId={userId}
                initialTab={followModalTab}
            />
        </div>
    );
};

export default UserProfile;
