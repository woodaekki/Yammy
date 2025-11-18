import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserPosts, getFollowStatus, followUser, unfollowUser } from '../api/snsApi';
import { getTickets, getTicketsByUserId } from '../../ticket/api/ticketApi';
import FollowListModal from './FollowListModal';
import TicketCard from '../../ticket/components/TicketCard';
import SNSNavigationBar from './SNSNavigationBar';
import { getTeamColors } from '../utils/teamColors';
import { TEAM_LOGOS } from '../../utils/teamLogos';
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
            
            // ✅ 백엔드에서 보낸 userInfo 사용 (posts 없어도 항상 있음)
            if (response.userInfo) {
                setProfileData({
                    name: response.userInfo.nickname || '사용자',
                    username: `@${response.userInfo.nickname || 'user'}`,
                    avatar: response.userInfo.profileImage || DEFAULT_PROFILE_IMAGE,
                    postsCount: response.posts?.length || 0,
                    team: response.userInfo.team || '',
                    bio: response.userInfo.bio || '',
                });
            } else {
                // userInfo가 없으면 에러 (백엔드 문제)
                throw new Error('사용자 정보를 불러올 수 없습니다.');
            }

            // 게시글이 있으면 설정
            setPosts(response.posts || []);
            
        } catch (error) {
            console.error('프로필 로드 실패:', error);
            alert(error.message || '프로필을 불러올 수 없습니다.');
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
                <SNSNavigationBar />
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
            {/* SNS 네비게이션 바 */}
            <SNSNavigationBar />

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
                                <div className="profile-team">
                                    <img
                                        src={TEAM_LOGOS[profileData.team || currentUser.team]}
                                        alt={profileData.team || currentUser.team}
                                        className="profile-team-logo"
                                    />
                                    <span className="profile-team-name">
                                        {profileData.team || currentUser.team}
                                    </span>
                                </div>
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
                    게시물
                </button>
                <button
                    className={`tab-button ${activeTab === 'tickets' ? 'active' : ''}`}
                    onClick={() => handleTabChange('tickets')}
                >
                    발급받은 티켓
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
                                        showNFTSection={false}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

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
