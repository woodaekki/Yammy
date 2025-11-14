import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart } from "react-icons/fa";
import { FiMessageCircle, FiSend } from "react-icons/fi";
import { getAllPosts, togglePostLike, followUser, unfollowUser, deletePost } from './api/snsApi';
import { getTeamColors } from './utils/teamColors';
import './styles/SNSPage.css';

// 시간 포맷 함수
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const now = new Date();
  const diffInMs = now - koreaTime;
 
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  if (diffInDays < 7) return `${diffInDays}일 전`;
  return koreaTime.toLocaleDateString('ko-KR');
};

// 이미지 모달 컴포넌트
const ImageModal = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <button className="modal-close-btn" onClick={onClose}>×</button>

      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="modal-image"
        />

        {images.length > 1 && (
          <>
            <button className="modal-nav-btn prev" onClick={handlePrev}>
              ‹
            </button>
            <button className="modal-nav-btn next" onClick={handleNext}>
              ›
            </button>
            <div className="modal-image-counter">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// 이미지 캐러셀 컴포넌트
const ImageCarousel = ({ images, postId, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const handleDragStart = (e) => {
    if (images.length <= 1) return;
    setIsDragging(true);
    setHasDragged(false);
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    setStartPos(clientX);
    setDragOffset(0);
    setDragStartTime(Date.now());
  };

  const handleDragMove = (e) => {
    if (!isDragging || images.length <= 1) return;
    e.preventDefault();
    setHasDragged(true);
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const diff = clientX - startPos;
    const containerWidth = e.currentTarget.offsetWidth;
    const movePercentage = (diff / containerWidth) * 100;
    setDragOffset(movePercentage);
  };

  const handleDragEnd = () => {
    if (!isDragging || images.length <= 1) return;
    setIsDragging(false);
    const dragDuration = Date.now() - dragStartTime;
    const isQuickSwipe = dragDuration < 300 && Math.abs(dragOffset) > 10;

    if ((isQuickSwipe && dragOffset < -5) || dragOffset < -30) {
      if (currentIndex < images.length - 1) setCurrentIndex(currentIndex + 1);
    } else if ((isQuickSwipe && dragOffset > 5) || dragOffset > 30) {
      if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    }
    setDragOffset(0);
  };

  const handleImageClick = () => {
    // 드래그가 아닌 클릭만 처리
    if (!hasDragged) {
      onImageClick(currentIndex);
    }
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
            transition: isDragging ? 'none' : 'transform 0.4s ease-in-out',
          }}
        >
          {images.map((image, index) => (
            <div key={index} className="carousel-slide" onClick={handleImageClick}>
              <img src={image} alt={`post ${postId} image ${index + 1}`} draggable="false" />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="carousel-dots">
          {images.map((_, index) => (
            <span key={index} className={`dot ${index === currentIndex ? 'active' : ''}`} />
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
  const [followingInProgress, setFollowingInProgress] = useState(new Set());
  const [modalImage, setModalImage] = useState(null);
  const observerTarget = useRef(null);
  const currentUserId = JSON.parse(localStorage.getItem('memberId') || 'null');
  const teamColors = getTeamColors();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const response = await getAllPosts(nextCursor);
      const newPosts = response.posts;
      setPosts((prev) => [...prev, ...newPosts]);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasNext);
    } catch (err) {
      console.error('게시글 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) loadPosts();
      },
      { threshold: 0.1, rootMargin: '200px' }
    );
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => target && observer.unobserve(target);
  }, [hasMore, isLoading, nextCursor]);

  const handleToggleLike = async (postId) => {
    try {
      const response = await togglePostLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isLiked: response.isLiked, likeCount: response.likeCount } : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFollow = async (memberId, isFollowing) => {
    // 이미 처리 중이면 무시
    if (followingInProgress.has(memberId)) {
      console.log('이미 처리 중입니다.');
      return;
    }

    // 처리 중 상태 추가
    setFollowingInProgress(prev => new Set([...prev, memberId]));

    try {
      console.log('팔로우 토글 시도:', { memberId, isFollowing });
      
      if (isFollowing) {
        await unfollowUser(memberId);
        console.log('언팔로우 성공');
      } else {
        await followUser(memberId);
        console.log('팔로우 성공');
      }
      
      // 성공 시 UI 업데이트
      setPosts((prev) =>
        prev.map((p) =>
          p.memberId === memberId ? { ...p, isFollowing: !isFollowing } : p
        )
      );
    } catch (err) {
      console.error('팔로우 토글 실패:', err);
      console.error('에러 상세:', err.response?.data);
      
      // 사용자에게 친절한 에러 메시지 표시
      const errorMessage = err.response?.data?.message || err.message;
      
      if (errorMessage && errorMessage.includes('이미 팔로우')) {
        alert('이미 팔로우한 사용자입니다.');
        // UI 상태를 서버 상태와 동기화
        setPosts((prev) =>
          prev.map((p) =>
            p.memberId === memberId ? { ...p, isFollowing: true } : p
          )
        );
      } else if (errorMessage && errorMessage.includes('팔로우 중이 아닙니다')) {
        alert('이미 언팔로우한 사용자입니다.');
        // UI 상태를 서버 상태와 동기화
        setPosts((prev) =>
          prev.map((p) =>
            p.memberId === memberId ? { ...p, isFollowing: false } : p
          )
        );
      } else {
        alert('팔로우 처리 중 오류가 발생했습니다.');
      }
    } finally {
      // 처리 중 상태 제거
      setFollowingInProgress(prev => {
        const next = new Set(prev);
        next.delete(memberId);
        return next;
      });
    }
  };

  const handleEditPost = (id) => navigate(`/post/edit/${id}`);
  
  const handleDeletePost = async (id) => {
    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) return;
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setOpenMenuPostId(null);
    } catch (err) {
      console.error(err);
      alert('게시글 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleToggleMenu = (id) => setOpenMenuPostId(openMenuPostId === id ? null : id);

  return (
    <div className="sns-page" style={{ '--team-color': teamColors.bgColor }}>
      <div className="feed-container">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            {/* 게시물 헤더 */}
            <div className="post-header">
              <div className="post-author">
                <img
                  src={post.profileImage || '/nomal.jpg'}
                  alt={post.nickname}
                  className="author-avatar"
                  onError={(e) => (e.target.src = '/nomal.jpg')}
                  onClick={() => navigate(`/user/${post.memberId}`)}
                />
                <div className="author-info">
                  <h3 className="author-name">{post.nickname}</h3>
                  <p className="post-time">{formatTimeAgo(post.createdAt)}</p>
                </div>
              </div>

              <div className="post-header-right">
                {post.memberId === currentUserId ? (
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
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="delete-btn"
                        >
                          <i className="fas fa-trash"></i> 삭제
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className={`follow-btn ${post.isFollowing ? 'following' : ''}`}
                    onClick={() => handleToggleFollow(post.memberId, post.isFollowing)}
                    disabled={followingInProgress.has(post.memberId)}
                  >
                    {followingInProgress.has(post.memberId) 
                      ? '처리중...' 
                      : post.isFollowing ? '팔로잉' : '팔로우'}
                  </button>
                )}
              </div>
            </div>

            {/* 게시물 내용 */}
            {post.caption && (
              <div className="post-content">
                <p>{post.caption}</p>
              </div>
            )}

            {/* 이미지 캐러셀 */}
            <ImageCarousel
              images={post.imageUrls}
              postId={post.id}
              onImageClick={(index) =>
                setModalImage({ images: post.imageUrls, initialIndex: index })
              }
            />

            {/* 액션 버튼 */}
            <div className="post-actions">
              <div className="action-buttons">
                <button
                  className={`action-btn ${post.isLiked ? 'liked' : ''}`}
                  onClick={() => handleToggleLike(post.id)}
                >
                  <FaHeart className="action-icon" />
                  <span className="action-count">{post.likeCount}</span>
                </button>
                <button
                  className="action-btn"
                  onClick={() => navigate(`/post/${post.id}/comments`)}
                >
                  <FiMessageCircle className="action-icon comment-icon" />
                  <span className="action-count">{post.commentCount}</span>
                </button>
                <button className="action-btn">
                  <FiSend className="action-icon send-icon" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div ref={observerTarget} className="observer-target" />
      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>게시물을 불러오는 중...</p>
        </div>
      )}
      <button
        className="floating-create-btn"
        onClick={() => navigate('/post/create')}
      >
        +
      </button>

      {/* 이미지 모달 */}
      {modalImage && (
        <ImageModal
          images={modalImage.images}
          initialIndex={modalImage.initialIndex}
          onClose={() => setModalImage(null)}
        />
      )}
    </div>
  );
};

export default SNSPage;