import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaHeart } from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";
import {
  getPost,
  getComments,
  createComment,
  toggleCommentLike,
  deleteComment as deleteCommentApi,
  togglePostLike
} from '../api/snsApi';
import { getTeamColors } from '../utils/teamColors';
import '../styles/CommentPage.css';

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

const ImageCarousel = ({ images = [], postId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [lastPos, setLastPos] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const handleDragStart = (e) => {
    if (images.length <= 1) return;
    setIsDragging(true);
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    setStartPos(clientX);
    setLastPos(clientX);
    setDragOffset(0);
  };

  const handleDragMove = (e) => {
    if (!isDragging || images.length <= 1) return;
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    setLastPos(clientX);
    const diff = clientX - startPos;
    const containerWidth = e.currentTarget.offsetWidth || 1;
    const movePercentage = (diff / containerWidth) * 100;
    setDragOffset(movePercentage);
  };

  const handleDragEnd = () => {
    if (!isDragging || images.length <= 1) return;
    setIsDragging(false);
    const diffPx = lastPos - startPos;
    const absDiffPx = Math.abs(diffPx);

    if (absDiffPx > 30) {
      if (diffPx < 0 && currentIndex < images.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (diffPx > 0 && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    }
    setDragOffset(0);
  };

  if (!images.length) return null;

  return (
    <div className="image-carousel">
      <div
        className="carousel-slider"
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
            transition: isDragging ? 'none' : 'transform 0.25s ease-out',
          }}
        >
          {images.map((img, idx) => (
            <div key={idx} className="carousel-slide">
              <img src={img} alt={`post-${postId}-img-${idx}`} draggable="false" />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="carousel-dots">
            {images.map((_, idx) => (
              <span key={idx} className={`dot ${idx === currentIndex ? 'active' : ''}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [postData, setPostData] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [showCommentMenu, setShowCommentMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState('oldest'); // 'oldest' | 'newest'
  const [teamColors] = useState(getTeamColors());
  const currentUserId = Number(localStorage.getItem('memberId'));
  const userProfileImage = localStorage.getItem('profileImage') || '/nomal.jpg';

  useEffect(() => {
    loadPost();
    loadComments();
  }, [postId]);

  const loadPost = async () => {
    try {
      const res = await getPost(postId);
      setPostData(res);
    } catch (err) {
      console.error("게시글 로드 실패:", err);
      navigate(-1);
    }
  };

  const loadComments = async () => {
    try {
      const res = await getComments(postId);
      setComments(res.comments || []);
    } catch (err) {
      console.error("댓글 로드 실패:", err);
    }
  };

  // 정렬된 댓글 목록
  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === 'oldest' ? dateA - dateB : dateB - dateA;
  });

  const handleTogglePostLike = async () => {
    try {
      const res = await togglePostLike(postId);
      setPostData({ ...postData, isLiked: res.isLiked, likeCount: res.likeCount });
    } catch (err) {
      console.error("좋아요 실패:", err);
    }
  };

  const handleToggleCommentLike = async (commentId) => {
    try {
      const res = await toggleCommentLike(commentId);
      setComments(comments.map(c =>
        c.id === commentId ? { ...c, isLiked: res.isLiked, likeCount: res.likeCount } : c
      ));
    } catch (err) {
      console.error("댓글 좋아요 실패:", err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return;
    try {
      await createComment(postId, commentInput);
      setCommentInput('');
      loadComments();
      loadPost();
    } catch (err) {
      console.error("댓글 작성 실패:", err);
    }
  };

  const handleDeleteComment = async () => {
    const confirmed = window.confirm("이 댓글을 정말 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
        await deleteCommentApi(selectedCommentId);
        setComments(comments.filter(c => c.id !== selectedCommentId));
        setShowCommentMenu(false);
        loadPost();
    } catch (err) {
        console.error("댓글 삭제 실패:", err);
        alert("댓글 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
    };


  return (
    <div className="comment-page" style={{ '--team-color': teamColors.bgColor }}>
      {postData && (
        <div className="post-card">
          <div className="post-header">
            <div className="post-author">
              <img
                src={postData.profileImage || '/nomal.jpg'}
                alt={postData.nickname}
                className="author-avatar"
              />
              <div className="author-info">
                <h3 className="author-name">{postData.nickname}</h3>
                <p className="post-time">{formatTimeAgo(postData.createdAt)}</p>
              </div>
            </div>
          </div>

          {postData.caption && (
            <div className="post-content">
              <p>{postData.caption}</p>
            </div>
          )}

          <ImageCarousel images={postData.imageUrls || []} postId={postData.id} />

          <div className="post-actions">
            <div className="action-buttons">
              <button
                className={`action-btn ${postData.isLiked ? 'liked' : ''}`}
                onClick={handleTogglePostLike}
              >
                <FaHeart className="action-icon" />
                <span className="action-count">{postData.likeCount || 0}</span>
              </button>
              <button className="action-btn">
                <FiMessageCircle className="action-icon comment-icon" />
                <span className="action-count">{comments.length}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="comments-scroll">
        {comments.length > 0 && (
          <div className="comment-sort-controls">
            <button
              className={`sort-btn ${sortOrder === 'oldest' ? 'active' : ''}`}
              onClick={() => setSortOrder('oldest')}
            >
              오래된순
            </button>
            <button
              className={`sort-btn ${sortOrder === 'newest' ? 'active' : ''}`}
              onClick={() => setSortOrder('newest')}
            >
              최신순
            </button>
          </div>
        )}
        {comments.length === 0 ? (
          <div className="empty-comments">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</div>
        ) : (
          sortedComments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-meta">
                <img
                  src={comment.profileImage || '/nomal.jpg'}
                  alt={comment.nickname}
                  className="comment-avatar"
                />
                <div className="comment-meta-info">
                  <span className="comment-author">{comment.nickname}</span>
                  <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                </div>
                {comment.memberId === currentUserId && (
                  <button
                    className="comment-menu-btn"
                    onClick={() => {
                      setSelectedCommentId(comment.id);
                      setShowCommentMenu(true);
                    }}
                  >
                    ⋯
                  </button>
                )}
              </div>
              <p className="comment-text">{comment.content}</p>
              <button
                className={`comment-like ${comment.isLiked ? 'liked' : ''}`}
                onClick={() => handleToggleCommentLike(comment.id)}
              >
                <FaHeart className="comment-like-icon" />
                <span>{comment.likeCount || 0}</span>
              </button>
            </div>
          ))
        )}
      </div>

      <div className="comment-input-section">
        <img src={userProfileImage} alt="내 프로필" className="my-avatar" />
        <textarea
          className="comment-input"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder="댓글 달기..."
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleCommentSubmit();
            }
          }}
        />
        <button
          className="send-btn"
          onClick={handleCommentSubmit}
          disabled={!commentInput.trim()}
        >
          ➤
        </button>
      </div>

      {showCommentMenu && (
        <div className="comment-menu-modal" onClick={() => setShowCommentMenu(false)}>
            <div className="comment-menu-content" onClick={(e) => e.stopPropagation()}>
            <button className="menu-option delete" onClick={handleDeleteComment}>
                삭제하기
            </button>
            <div className="menu-divider"></div>
            <button className="cancel-btn" onClick={() => setShowCommentMenu(false)}>
                취소
            </button>
            </div>
        </div>
        )}
    </div>
  );
};

export default CommentPage;
