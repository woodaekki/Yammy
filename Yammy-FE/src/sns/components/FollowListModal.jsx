import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFollowers, getFollowing, followUser, unfollowUser } from '../api/snsApi';
import { getTeamColors } from '../utils/teamColors';
import '../styles/FollowListModal.css';

const FollowListModal = ({ isOpen, onClose, userId, initialTab = 'followers' }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const teamColors = getTeamColors();

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab); // 모달이 열릴 때 initialTab으로 설정
            loadData();
        }
    }, [isOpen, userId]);

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [activeTab]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'followers') {
                const response = await getFollowers(userId);
                setFollowers(response.content || []);
            } else {
                const response = await getFollowing(userId);
                setFollowing(response.content || []);
            }
        } catch (error) {
            console.error('팔로우 목록 로드 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFollowToggle = async (targetUserId, isCurrentlyFollowing) => {
        try {
            if (isCurrentlyFollowing) {
                await unfollowUser(targetUserId);
            } else {
                await followUser(targetUserId);
            }
            // 목록 새로고침
            loadData();
        } catch (error) {
            console.error('팔로우 토글 실패:', error);
            alert('팔로우 처리에 실패했습니다.');
        }
    };

    const handleUserClick = (targetUserId) => {
        onClose();
        navigate(`/user/${targetUserId}`);
    };

    if (!isOpen) return null;

    const currentList = activeTab === 'followers' ? followers : following;

    return (
        <div className="follow-modal-overlay" onClick={onClose}>
            <div
                className="follow-modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    '--team-color': teamColors.bgColor,
                    '--team-text-color': teamColors.textColor
                }}
            >
                {/* 헤더 */}
                <div className="follow-modal-header">
                    <h2>팔로우</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {/* 탭 */}
                <div className="follow-modal-tabs">
                    <button
                        className={`tab ${activeTab === 'followers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('followers')}
                    >
                        팔로워
                    </button>
                    <button
                        className={`tab ${activeTab === 'following' ? 'active' : ''}`}
                        onClick={() => setActiveTab('following')}
                    >
                        팔로잉
                    </button>
                </div>

                {/* 목록 */}
                <div className="follow-modal-list">
                    {isLoading ? (
                        <div className="loading-state">로딩 중...</div>
                    ) : currentList.length === 0 ? (
                        <div className="empty-state">
                            {activeTab === 'followers' ? '팔로워가 없습니다.' : '팔로잉한 사람이 없습니다.'}
                        </div>
                    ) : (
                        currentList.map((user) => (
                            <div key={user.memberId} className="follow-item">
                                <div className="user-info" onClick={() => handleUserClick(user.memberId)}>
                                    <img
                                        src={user.profileImage || 'https://via.placeholder.com/40'}
                                        alt={user.nickname}
                                        className="user-avatar"
                                    />
                                    <div className="user-details">
                                        <div className="user-nickname">{user.nickname}</div>
                                        {user.team && <div className="user-team">{user.team}</div>}
                                    </div>
                                </div>
                                <button
                                    className={`follow-btn ${user.isFollowing ? 'following' : ''}`}
                                    onClick={() => handleFollowToggle(user.memberId, user.isFollowing)}
                                >
                                    {user.isFollowing ? '팔로잉' : '팔로우'}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowListModal;
