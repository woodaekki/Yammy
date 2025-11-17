import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers, followUser, unfollowUser, getAllUsers } from '../api/snsApi';
import { getTeamColors } from '../utils/teamColors';
import { TEAM_LOGOS } from '../../utils/teamLogos';
import '../styles/UserSearchPage.css';

const UserSearchPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [followingInProgress, setFollowingInProgress] = useState(new Set());
  const teamColors = getTeamColors();
  const currentUserId = JSON.parse(localStorage.getItem('memberId') || 'null');

  // 초기 로드 시 랜덤 유저 10명 가져오기
  useEffect(() => {
    loadRandomUsers();
  }, []);

  const loadRandomUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      // 50명 가져온 후 본인 제외하고 랜덤하게 섞어서 10명만 선택
      const results = await getAllUsers(0, 50);
      const filtered = results.filter(user => user.memberId !== currentUserId);
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      setUsers(shuffled.slice(0, 10));
    } catch (err) {
      console.error('유저 목록 로드 실패:', err);
      setError('유저 목록을 불러오는 중 오류가 발생했습니다.');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };


  // 검색 실행
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // 검색어가 없으면 랜덤 유저 목록 보여주기
      loadRandomUsers();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const results = await searchUsers(searchQuery);
      setUsers(results);

      if (results.length === 0) {
        setError('검색 결과가 없습니다.');
      }
    } catch (err) {
      console.error('검색 실패:', err);
      setError('검색 중 오류가 발생했습니다.');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 엔터키로 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 팔로우/언팔로우 처리
  const handleToggleFollow = async (memberId, isFollowing) => {
    if (followingInProgress.has(memberId)) return;

    setFollowingInProgress(prev => new Set([...prev, memberId]));

    try {
      if (isFollowing) {
        await unfollowUser(memberId);
      } else {
        await followUser(memberId);
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.memberId === memberId ? { ...u, isFollowing: !isFollowing } : u
        )
      );
    } catch (err) {
      console.error('팔로우 토글 실패:', err);
      alert('팔로우 처리 중 오류가 발생했습니다.');
    } finally {
      setFollowingInProgress(prev => {
        const next = new Set(prev);
        next.delete(memberId);
        return next;
      });
    }
  };

  return (
    <div className="user-search-page" style={{ '--team-color': teamColors.bgColor }}>
      {/* 헤더 */}
      <div className="search-header" style={{ backgroundColor: teamColors.bgColor }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className="search-title">유저 찾기</h1>
        <div className="header-spacer"></div>
      </div>

      {/* 검색 바 */}
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="닉네임으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            maxLength={50}
          />
          {searchQuery && (
            <button
              className="clear-btn"
              onClick={() => {
                setSearchQuery('');
                setError('');
                loadRandomUsers();
              }}
            >
              ✕
            </button>
          )}
        </div>
        <button
          className="search-btn"
          onClick={handleSearch}
          style={{ backgroundColor: teamColors.bgColor, padding: '0 16px', minWidth: '60px', fontSize: '0.85rem' }}
        >
          검색
        </button>
      </div>

      {/* 검색 결과 */}
      <div className="search-results">
        {isLoading && (
          <div className="loading-message">
            <div className="spinner"></div>
            <p>검색 중...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="empty-message">
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>😕</div>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && users.length > 0 && (
          <>
            <div className="section-header">
              <h2 className="section-title">
                {searchQuery ? '검색 결과' : '다른 유저 찾기'}
              </h2>
              {!searchQuery && (
                <p className="section-description">새로운 유저를 만나보세요</p>
              )}
            </div>
            <div className="users-list">
              {users.map((user) => (
                <div key={user.memberId} className="user-item">
                  <div
                    className="user-info"
                    onClick={() => navigate(`/user/${user.memberId}`)}
                  >
                    <img
                      src={user.profileImage || '/nomal.jpg'}
                      alt={user.nickname}
                      className="user-avatar"
                      onError={(e) => (e.target.src = '/nomal.jpg')}
                    />
                    <div className="user-details">
                      <h3 className="user-nickname">{user.nickname}</h3>
                      {user.team && (
                        <div className="user-team">
                          <img
                            src={TEAM_LOGOS[user.team]}
                            alt={user.team}
                            className="user-team-logo"
                          />
                          <span className="user-team-name">{user.team}</span>
                        </div>
                      )}
                      <p className="user-stats">
                        팔로워 {user.followerCount || 0} · 게시물 {user.postCount || 0}
                      </p>
                    </div>
                  </div>

                  {user.memberId !== currentUserId && (
                    <button
                      className={`follow-btn ${user.isFollowing ? 'following' : ''}`}
                      onClick={() => handleToggleFollow(user.memberId, user.isFollowing)}
                      disabled={followingInProgress.has(user.memberId)}
                    >
                      {followingInProgress.has(user.memberId)
                        ? '처리중...'
                        : user.isFollowing
                        ? '언팔로우'
                        : '팔로우'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserSearchPage;
