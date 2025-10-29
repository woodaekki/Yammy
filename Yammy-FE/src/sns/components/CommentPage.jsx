import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/CommentPage.css';

const CommentPage = () => {
    const navigate = useNavigate();
    const { postId } = useParams();

    const [comments, setComments] = useState([
        {
            id: 1,
            author: '이수진',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
            time: '1시간 전',
            content: '완전 동감해요! 특히 후반전 역전골이 진짜 짜릿했어요 ⚽️',
            likes: 8,
            isLiked: false,
            replies: []
        },
        {
            id: 2,
            author: '박준호',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
            time: '45분 전',
            content: '골키퍼 선방도 대단했어요! 정말 명경기였네요 👏',
            likes: 12,
            isLiked: true,
            replies: [
                {
                    id: 21,
                    author: '김민수',
                    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
                    time: '30분 전',
                    content: '맞아요! 그 선방 장면 GIF로 만들어야겠어요 😄'
                }
            ]
        },
        {
            id: 3,
            author: '정미영',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
            time: '20분 전',
            content: '다음 경기도 기대되네요! 같이 응원해요 💪',
            likes: 5,
            isLiked: false,
            replies: []
        }
    ]);

    const [commentInput, setCommentInput] = useState('');
    const [showCommentMenu, setShowCommentMenu] = useState(false);
    const [selectedCommentId, setSelectedCommentId] = useState(null);

    const postPreview = {
        author: '김민수',
        avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
        time: '2시간 전',
        content: '오늘 경기 정말 대박이었다! 마지막 골 장면에서 소름이 돋았어요 🔥',
        likes: 127,
        comments: 23
    };

    const goBack = () => {
        navigate(-1);
    };

    const toggleLike = (commentId) => {
        setComments(comments.map(comment =>
            comment.id === commentId
                ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 }
                : comment
        ));
    };

    const handleCommentSubmit = () => {
        if (!commentInput.trim()) return;

        const newComment = {
            id: Date.now(),
            author: '나',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
            time: '방금 전',
            content: commentInput,
            likes: 0,
            isLiked: false,
            replies: []
        };

        setComments([newComment, ...comments]);
        setCommentInput('');
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

    const deleteComment = () => {
        setComments(comments.filter(comment => comment.id !== selectedCommentId));
        closeCommentMenu();
    };

    return (
        <div className="comment-page">
            {/* 헤더 */}
            <div className="comment-header">
                <button onClick={goBack} className="back-btn">
                    ←
                </button>
                <h1 className="header-title">댓글</h1>
                <button className="menu-btn">⋮</button>
            </div>

            {/* 게시물 미리보기 */}
            <div className="post-preview">
                <div className="post-preview-author">
                    <img src={postPreview.avatar} alt={postPreview.author} />
                    <div>
                        <span className="author-name">{postPreview.author}</span>
                        <span className="post-time">{postPreview.time}</span>
                    </div>
                </div>
                <p className="post-content">{postPreview.content}</p>
                <div className="post-stats">
                    <span>좋아요 {postPreview.likes}개</span>
                    <span>댓글 {postPreview.comments}개</span>
                </div>
            </div>

            {/* 댓글 목록 */}
            <div className="comments-list">
                {comments.map(comment => (
                    <div key={comment.id} className="comment-item">
                        <img src={comment.avatar} alt={comment.author} className="comment-avatar" />
                        <div className="comment-content-wrapper">
                            <div className="comment-header-info">
                                <span className="comment-author">{comment.author}</span>
                                <span className="comment-time">{comment.time}</span>
                            </div>
                            <p className="comment-text">{comment.content}</p>
                            <div className="comment-actions">
                                <button
                                    className={`like-btn ${comment.isLiked ? 'liked' : ''}`}
                                    onClick={() => toggleLike(comment.id)}
                                >
                                    {comment.isLiked ? '❤️' : '🤍'} {comment.likes}
                                </button>
                                <button className="reply-btn">답글</button>
                                <button className="more-btn" onClick={() => openCommentMenu(comment.id)}>
                                    ⋯
                                </button>
                            </div>

                            {/* 답글 */}
                            {comment.replies.length > 0 && (
                                <div className="replies">
                                    {comment.replies.map(reply => (
                                        <div key={reply.id} className="reply-item">
                                            <img src={reply.avatar} alt={reply.author} className="reply-avatar" />
                                            <div>
                                                <div className="reply-header-info">
                                                    <span className="reply-author">{reply.author}</span>
                                                    <span className="reply-time">{reply.time}</span>
                                                </div>
                                                <p className="reply-text">{reply.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* 댓글 입력 */}
            <div className="comment-input-section">
                <img
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg"
                    alt="내 프로필"
                    className="my-avatar"
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
                        <button className="menu-option delete" onClick={deleteComment}>삭제하기</button>
                        <button className="menu-option">신고하기</button>
                        <button className="cancel-btn" onClick={closeCommentMenu}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentPage;
