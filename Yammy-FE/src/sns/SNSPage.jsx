import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPosts, togglePostLike, followUser, unfollowUser, deletePost } from './api/snsApi';
import { getTeamColors } from './utils/teamColors';
import './styles/SNSPage.css';

// 시간 포맷 헬퍼 함수
const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays < 7) return `${diffInDays}일 전`;
    return date.toLocaleDateString('ko-KR');
};

const ImageCarousel = ({ images, postId }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [dragStartTime, setDragStartTime] = useState(0);

    // 드래그 시작
    const handleDragStart = (e) => {
        if (images.length <= 1) return;

        setIsDragging(true);
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        setStartPos(clientX);
        setDragOffset(0);
        setDragStartTime(Date.now());
    };

    // 드래그 중
    const handleDragMove = (e) => {
        if (!isDragging || images.length <= 1) return;
        e.preventDefault();

        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const diff = clientX - startPos;

        const containerWidth = e.currentTarget.offsetWidth;
        const movePercentage = (diff / containerWidth) * 100;

        setDragOffset(movePercentage);
    };

    // 드래그 종료
    const handleDragEnd = () => {
        if (!isDragging || images.length <= 1) return;
        setIsDragging(false);

        const dragDuration = Date.now() - dragStartTime;
        const isQuickSwipe = dragDuration < 300 && Math.abs(dragOffset) > 10;

        if ((isQuickSwipe && dragOffset < -5) || dragOffset < -30) {
            if (currentIndex < images.length - 1) {
                setCurrentIndex(currentIndex + 1);
            }
        } else if ((isQuickSwipe && dragOffset > 5) || dragOffset > 30) {
            if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
            }
        }

        setDragOffset(0);
    };

    return (
        <div className="image-carousel">
            <div
                className={`carousel-slider ${images.length <= 1 ? 'single-image' : ''}`}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
            >
                <div
                    className="carousel-track"
                    style={{
                        transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}%))`,
                        transition: isDragging ? 'none' : 'transform 0.4s ease-in-out'
                    }}
                >
                    {images.map((image, index) => (
                        <div key={index} className="carousel-slide">
                            <img
                                src={image}
                                alt={`post ${postId} image ${index + 1}`}
                                draggable="false"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {images.length > 1 && (
                <div className="carousel-dots">
                    {images.map((_, index) => (
                        <span
                            key={index}
                            className={`dot ${index === currentIndex ? 'active' : ''}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const SNSPage = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [nextCursor, setNextCursor] = useState(null);
    const [openMenuPostId, setOpenMenuPostId] = useState(null);
    const observerTarget = useRef(null);
    const currentUserId = JSON.parse(localStorage.getItem('memberId') || 'null');
    const teamColors = getTeamColors();

    // 초기 게시글 로드
    useEffect(() => {
        loadPosts();
    }, []);

    // 게시글 로드 함수
    const loadPosts = async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        try {
            const response = await getAllPosts(nextCursor);
            const newPosts = response.posts;

            setPosts(prevPosts => [...prevPosts, ...newPosts]);
            setNextCursor(response.nextCursor);
            setHasMore(response.hasNext);
        } catch (error) {
            console.error('게시글 로드 실패:', error);
            alert('게시글을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // Intersection Observer 설정
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadPosts();
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );

        const currentTarget = observerTarget.current;

        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, isLoading, nextCursor]);

    // 좋아요 토글
    const handleToggleLike = async (postId) => {
        try {
            const response = await togglePostLike(postId);

            // 로컬 상태 업데이트
            setPosts(posts.map(post =>
                post.id === postId
                    ? {
                        ...post,
                        isLiked: response.isLiked,
                        likeCount: response.likeCount
                    }
                    : post
            ));
        } catch (error) {
            console.error('좋아요 토글 실패:', error);
            alert('좋아요 처리에 실패했습니다.');
        }
    };

    // 팔로우 토글
    const handleToggleFollow = async (memberId, isCurrentlyFollowing) => {
        try {
            if (isCurrentlyFollowing) {
                await unfollowUser(memberId);
            } else {
                await followUser(memberId);
            }

            // 로컬 상태 업데이트
            setPosts(posts.map(post =>
                post.memberId === memberId
                    ? { ...post, isFollowing: !isCurrentlyFollowing }
                    : post
            ));
        } catch (error) {
            console.error('팔로우 토글 실패:', error);
            alert('팔로우 처리에 실패했습니다.');
        }
    };

    // 게시글 수정 페이지로 이동
    const handleEditPost = (postId) => {
        navigate(`/post/edit/${postId}`);
    };

    // 게시글 삭제
    const handleDeletePost = async (postId) => {
        if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

        try {
            await deletePost(postId);

            // 로컬 상태 업데이트 (게시글 제거)
            setPosts(posts.filter(post => post.id !== postId));

            setOpenMenuPostId(null);
            alert('게시글이 삭제되었습니다.');
        } catch (error) {
            console.error('게시글 삭제 실패:', error);
            alert('게시글 삭제에 실패했습니다.');
        }
    };

    // 메뉴 토글
    const handleToggleMenu = (postId) => {
        setOpenMenuPostId(openMenuPostId === postId ? null : postId);
    };

    return (
        <div
            className="sns-page"
            style={{
                '--team-color': teamColors.bgColor,
                '--team-text-color': teamColors.textColor
            }}
        >
            {/* 피드 섹션 */}
            <div className="feed-container">
                {posts.map(post => (
                    <div key={post.id} className="post-card">
                        {/* 게시물 헤더 */}
                        <div className="post-header">
                            <div className="post-author" onClick={() => navigate(`/user/${post.memberId}`)}>
                                <img
                                    src={post.profileImage || '/nomal.jpg'}
                                    alt={post.nickname}
                                    className="author-avatar"
                                    onError={(e) => { e.target.src = '/nomal.jpg'; }}
                                />
                                <div className="author-info">
                                    <h3 className="author-name">{post.nickname}</h3>
                                    <p className="post-time">{formatTimeAgo(post.createdAt)}</p>
                                </div>
                            </div>
                            {post.memberId === currentUserId && (
                                <div className="post-menu-wrapper">
                                    <button
                                        className="post-menu-btn"
                                        onClick={() => handleToggleMenu(post.id)}
                                    >
                                        ⋯
                                    </button>
                                    {openMenuPostId === post.id && (
                                        <div className="post-menu-dropdown">
                                            <button onClick={() => handleEditPost(post.id)}>
                                                <i className="fas fa-edit"></i> 수정
                                            </button>
                                            <button onClick={() => handleDeletePost(post.id)} className="delete-btn">
                                                <i className="fas fa-trash"></i> 삭제
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 게시물 내용 */}
                        {post.caption && (
                            <div className="post-content">
                                <p>{post.caption}</p>
                            </div>
                        )}

                        {/* 게시물 이미지 */}
                        <ImageCarousel images={post.imageUrls} postId={post.id} />

                        {/* 게시물 액션 */}
                        <div className="post-actions">
                            <div className="action-buttons">
                                <button
                                    className={`action-btn ${post.isLiked ? 'liked' : ''}`}
                                    onClick={() => handleToggleLike(post.id)}
                                >
                                    <span className="action-icon">{post.isLiked ? '❤️' : '🤍'}</span>
                                    <span className="action-count">{post.likeCount}</span>
                                </button>
                                <button
                                    className="action-btn"
                                    onClick={() => navigate(`/post/${post.id}/comments`)}
                                >
                                    <span className="action-icon">💬</span>
                                    <span className="action-count">{post.commentCount}</span>
                                </button>
                                <button className="action-btn">
                                    <span className="action-icon">📤</span>
                                </button>
                            </div>
                            {/* 자신의 게시글이 아닐 때만 팔로우 버튼 표시 */}
                            {post.memberId !== JSON.parse(localStorage.getItem('memberId') || 'null') && (
                                <button
                                    className={`follow-btn ${post.isFollowing ? 'following' : ''}`}
                                    onClick={() => handleToggleFollow(post.memberId, post.isFollowing)}
                                >
                                    {post.isFollowing ? '팔로잉' : '팔로우'}
                                </button>
                            )}
                        </div>

                        {/* 좋아요 수 */}
                        <div className="post-likes">
                            <span>좋아요 {post.likeCount}개</span>
                        </div>
                    </div>
                ))}

                {/* Intersection Observer 타겟 */}
                <div ref={observerTarget} className="observer-target" />

                {/* 로딩 인디케이터 */}
                {isLoading && (
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <p>게시물을 불러오는 중...</p>
                    </div>
                )}

                {/* 더 이상 게시물이 없을 때 */}
                {!hasMore && posts.length > 0 && (
                    <div className="end-message">
                        <p>모든 게시물을 확인했습니다 ✓</p>
                    </div>
                )}

                {/* 게시물이 없을 때 */}
                {!isLoading && posts.length === 0 && (
                    <div className="empty-message">
                        <p>아직 게시물이 없습니다.</p>
                        <button onClick={() => navigate('/post/create')}>첫 게시물 작성하기</button>
                    </div>
                )}
            </div>

            {/* 플로팅 게시글 작성 버튼 */}
            <button className="floating-create-btn" onClick={() => navigate('/post/create')}>
                ✏️
            </button>
        </div>
    );
};

export default SNSPage;
