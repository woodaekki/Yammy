import { useState } from 'react';
import './SNSPage.css';

const ImageCarousel = ({ images, postId }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // 터치/마우스 스와이프 감지
    const handleTouchStart = (e) => {
        setTouchStart(e.type === 'touchstart' ? e.touches[0].clientX : e.clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.type === 'touchmove' ? e.touches[0].clientX : e.clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && currentIndex < images.length - 1) {
            goToNext();
        }
        if (isRightSwipe && currentIndex > 0) {
            goToPrev();
        }

        setTouchStart(0);
        setTouchEnd(0);
    };

    return (
        <div className="image-carousel">
            <div
                className="carousel-slider"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseMove={handleTouchMove}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
            >
                <div
                    className="carousel-track"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
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
    const [posts, setPosts] = useState([
        {
            id: 1,
            author: '김철수',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
            time: '2시간 전',
            content: '오늘 경기 정말 짜릿했다! 마지막 골 장면은 진짜 소름 돋았어 ⚽️🔥',
            images: [
                'https://storage.googleapis.com/uxpilot-auth.appspot.com/dce6e55300-6e1d23662ab252d21081.png',
                'https://storage.googleapis.com/uxpilot-auth.appspot.com/c9fb85da1e-45116d9a79a3ab78a16e.png',
                'https://storage.googleapis.com/uxpilot-auth.appspot.com/9a28a09c34-1b9e46f46d9df7dbde90.png'
            ],
            likes: 127,
            comments: 23,
            isLiked: false,
            isFollowing: false
        },
        {
            id: 2,
            author: '박영희',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
            time: '4시간 전',
            content: '새로운 농구화 겟! 이제 더 멋진 슛을 날릴 수 있을 것 같아 🏀✨',
            images: [
                'https://storage.googleapis.com/uxpilot-auth.appspot.com/98cb1f43e3-528b8a3b540bea1f4652.png'
            ],
            likes: 89,
            comments: 15,
            isLiked: true,
            isFollowing: true
        },
        {
            id: 3,
            author: '이민수',
            avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
            time: '6시간 전',
            content: '오늘 마라톤 완주! 개인 최고 기록 갱신했다 💪 다음엔 더 빠르게!',
            images: [
                'https://storage.googleapis.com/uxpilot-auth.appspot.com/60a72d35f1-09cace140106185bf5cc.png',
                'https://storage.googleapis.com/uxpilot-auth.appspot.com/e769c887d5-dd8311b543509738c710.png'
            ],
            likes: 156,
            comments: 34,
            isLiked: false,
            isFollowing: false
        }
    ]);

    const toggleLike = (postId) => {
        setPosts(posts.map(post =>
            post.id === postId
                ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
                : post
        ));
    };

    const toggleFollow = (postId) => {
        setPosts(posts.map(post =>
            post.id === postId
                ? { ...post, isFollowing: !post.isFollowing }
                : post
        ));
    };

    return (
        <div className="sns-page">
            {/* 피드 섹션 */}
            <div className="feed-container">
                {posts.map(post => (
                    <div key={post.id} className="post-card">
                        {/* 게시물 헤더 */}
                        <div className="post-header">
                            <div className="post-author">
                                <img src={post.avatar} alt={post.author} className="author-avatar" />
                                <div className="author-info">
                                    <h3 className="author-name">{post.author}</h3>
                                    <p className="post-time">{post.time}</p>
                                </div>
                            </div>
                            <button className="post-menu-btn">⋯</button>
                        </div>

                        {/* 게시물 내용 */}
                        <div className="post-content">
                            <p>{post.content}</p>
                        </div>

                        {/* 게시물 이미지 */}
                        <ImageCarousel images={post.images} postId={post.id} />

                        {/* 게시물 액션 */}
                        <div className="post-actions">
                            <div className="action-buttons">
                                <button
                                    className={`action-btn ${post.isLiked ? 'liked' : ''}`}
                                    onClick={() => toggleLike(post.id)}
                                >
                                    <span className="action-icon">{post.isLiked ? '❤️' : '🤍'}</span>
                                    <span className="action-count">{post.likes}</span>
                                </button>
                                <button className="action-btn">
                                    <span className="action-icon">💬</span>
                                    <span className="action-count">{post.comments}</span>
                                </button>
                                <button className="action-btn">
                                    <span className="action-icon">📤</span>
                                </button>
                            </div>
                            <button
                                className={`follow-btn ${post.isFollowing ? 'following' : ''}`}
                                onClick={() => toggleFollow(post.id)}
                            >
                                {post.isFollowing ? '팔로잉' : '팔로우'}
                            </button>
                        </div>

                        {/* 좋아요 수 */}
                        <div className="post-likes">
                            <span>좋아요 {post.likes}개</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SNSPage;
