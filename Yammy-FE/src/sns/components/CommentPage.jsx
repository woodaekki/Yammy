import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPost, getComments, createComment, toggleCommentLike, deleteComment as deleteCommentApi, togglePostLike } from '../api/snsApi';
import { getTeamColors } from '../utils/teamColors';
import '../styles/CommentPage.css';

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

const CommentPage = () => {
    const navigate = useNavigate();
    const { postId } = useParams();

    const [postData, setPostData] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const [showCommentMenu, setShowCommentMenu] = useState(false);
    const [selectedCommentId, setSelectedCommentId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [teamColors] = useState(getTeamColors());

    // 로컬스토리지에서 사용자 프로필 이미지 가져오기
    const userProfileImage = localStorage.getItem('profileImage') || '/nomal.jpg';

    // 게시글 정보 로드
    useEffect(() => {
        loadPost();
        loadComments();
    }, [postId]);

    const loadPost = async () => {
        try {
            const response = await getPost(postId);
            setPostData(response);
        } catch (error) {
            console.error('게시글 로드 실패:', error);
            alert('게시글을 불러올 수 없습니다.');
            navigate(-1);
        }
    };

    const loadComments = async () => {
        setIsLoading(true);
        try {
            const response = await getComments(postId);
            setComments(response.comments || []);
        } catch (error) {
            console.error('댓글 로드 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const goBack = () => {
        navigate(-1);
    };

    const toggleLike = async (commentId) => {
        try {
            const response = await toggleCommentLike(commentId);

            // 로컬 상태 업데이트
            setComments(comments.map(comment =>
                comment.id === commentId
                    ? { ...comment, isLiked: response.isLiked, likeCount: response.likeCount }
                    : comment
            ));
        } catch (error) {
            console.error('좋아요 토글 실패:', error);
        }
    };

    const handleTogglePostLike = async () => {
        try {
            const response = await togglePostLike(postId);

            // 게시물 상태 업데이트
            setPostData({
                ...postData,
                isLiked: response.isLiked,
                likeCount: response.likeCount
            });
        } catch (error) {
            console.error('게시물 좋아요 토글 실패:', error);
            alert('좋아요 처리에 실패했습니다.');
        }
    };

    const handleCommentSubmit = async () => {
        if (!commentInput.trim()) return;

        try {
            await createComment(postId, commentInput);
            setCommentInput('');
            // 댓글 목록 새로고침
            loadComments();
            // 게시글 정보도 새로고침 (댓글 수 업데이트)
            loadPost();
        } catch (error) {
            console.error('댓글 작성 실패:', error);
            alert('댓글 작성에 실패했습니다.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleCommentSubmit();
        }
    };

    const openCommentMenu = (commentId) => {
        setSelectedCommentId(commentId);
        setShowCommentMenu(true);
    };

    const closeCommentMenu = () => {
        setShowCommentMenu(false);
        setSelectedCommentId(null);
    };

    const handleDeleteComment = async () => {
        try {
            await deleteCommentApi(selectedCommentId);
            // 댓글 목록에서 제거
            setComments(comments.filter(comment => comment.id !== selectedCommentId));
            closeCommentMenu();
            // 게시글 정보 새로고침 (댓글 수 업데이트)
            loadPost();
        } catch (error) {
            console.error('댓글 삭제 실패:', error);
            alert('댓글 삭제에 실패했습니다.');
            closeCommentMenu();
        }
    };

    return (
        <div
            className="comment-page"
            style={{
                '--team-color': teamColors.bgColor,
                '--team-text-color': teamColors.textColor
            }}
        >
            {/* 게시물 상세 */}
            {postData && (
                <div className="post-detail-section">
                    <div className="post-author-info">
                        <img
                            src={postData.profileImage || '/nomal.jpg'}
                            alt={postData.nickname}
                            className="post-author-avatar"
                            onError={(e) => { e.target.src = '/nomal.jpg'; }}
                        />
                        <div className="post-author-details">
                            <h3 className="post-author-name">{postData.nickname}</h3>
                            <p className="post-time">{formatTimeAgo(postData.createdAt)}</p>
                        </div>
                    </div>
                    {postData.caption && (
                        <p className="post-caption">{postData.caption}</p>
                    )}
                    {postData.imageUrls && postData.imageUrls.length > 0 && (
                        <div className="post-images">
                            {postData.imageUrls.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`게시물 이미지 ${index + 1}`}
                                    className="post-image"
                                />
                            ))}
                        </div>
                    )}
                    <div className="post-actions-section">
                        <button
                            className={`post-like-btn ${postData.isLiked ? 'liked' : ''}`}
                            onClick={handleTogglePostLike}
                        >
                            <span className="like-icon">{postData.isLiked ? '❤️' : '🤍'}</span>
                            <span className="like-count">{postData.likeCount || 0}</span>
                        </button>
                        <span className="comment-count">💬 {postData.commentCount || 0}</span>
                    </div>
                </div>
            )}

            {/* 댓글 목록 */}
            <div className="comments-list">
                {isLoading ? (
                    <div className="loading-message">댓글을 불러오는 중...</div>
                ) : comments.length === 0 ? (
                    <div className="empty-comments">아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                            <img
                                src={comment.profileImage || '/nomal.jpg'}
                                alt={comment.nickname}
                                className="comment-avatar"
                                onError={(e) => { e.target.src = '/nomal.jpg'; }}
                            />
                            <div className="comment-content-wrapper">
                                <div className="comment-header-info">
                                    <span className="comment-author">{comment.nickname}</span>
                                    <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                                </div>
                                <p className="comment-text">{comment.content}</p>
                                <div className="comment-actions">
                                    <button
                                        className={`like-btn ${comment.isLiked ? 'liked' : ''}`}
                                        onClick={() => toggleLike(comment.id)}
                                    >
                                        {comment.isLiked ? '❤️' : '🤍'} {comment.likeCount}
                                    </button>
                                    <button className="more-btn" onClick={() => openCommentMenu(comment.id)}>
                                        ⋯
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 댓글 입력 */}
            <div className="comment-input-section">
                <img
                    src={userProfileImage}
                    alt="내 프로필"
                    className="my-avatar"
                    onError={(e) => { e.target.src = '/nomal.jpg'; }}
                />
                <div className="input-wrapper">
                    <textarea
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="댓글을 입력하세요..."
                        rows={1}
                    />
                </div>
                <button
                    className="submit-btn"
                    onClick={handleCommentSubmit}
                    disabled={!commentInput.trim()}
                >
                    ➤
                </button>
            </div>

            {/* 댓글 메뉴 모달 */}
            {showCommentMenu && (
                <div className="comment-menu-modal" onClick={closeCommentMenu}>
                    <div className="comment-menu-content" onClick={(e) => e.stopPropagation()}>
                        <h3>댓글 옵션</h3>
                        <button className="menu-option">수정하기</button>
                        <button className="menu-option delete" onClick={handleDeleteComment}>삭제하기</button>
                        <button className="menu-option">신고하기</button>
                        <button className="cancel-btn" onClick={closeCommentMenu}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentPage;
