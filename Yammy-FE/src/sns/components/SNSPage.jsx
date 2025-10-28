import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SNSPage.css';

const ImageCarousel = ({ images, postId }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [dragStartTime, setDragStartTime] = useState(0);

    // 드래그 시작
    const handleDragStart = (e) => {
        if (images.length <= 1) return; // 이미지가 1개면 드래그 안 함

        setIsDragging(true);
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        setStartPos(clientX);
        setDragOffset(0);
        setDragStartTime(Date.now());
    };

    // 드래그 중 (실시간으로 따라다님)
    const handleDragMove = (e) => {
        if (!isDragging || images.length <= 1) return; // 이미지가 1개면 드래그 안 함
        e.preventDefault();

        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const diff = clientX - startPos;

        // 드래그한 거리를 %로 변환
        const containerWidth = e.currentTarget.offsetWidth;
        const movePercentage = (diff / containerWidth) * 100;

        setDragOffset(movePercentage);
    };

    // 드래그 종료
    const handleDragEnd = () => {
        if (!isDragging || images.length <= 1) return; // 이미지가 1개면 드래그 안 함
        setIsDragging(false);

        const dragDuration = Date.now() - dragStartTime;
        const isQuickSwipe = dragDuration < 300 && Math.abs(dragOffset) > 10;

        // 다음 이미지로 (왼쪽 스와이프)
        if ((isQuickSwipe && dragOffset < -5) || dragOffset < -30) {
            if (currentIndex < images.length - 1) {
                setCurrentIndex(currentIndex + 1);
            }
        }
        // 이전 이미지로 (오른쪽 스와이프)
        else if ((isQuickSwipe && dragOffset > 5) || dragOffset > 30) {
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

    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observerTarget = useRef(null);

    // 새로운 게시물 데이터 생성 함수
    const generateNewPosts = (startId) => {
        const authors = ['김철수', '박영희', '이민수', '정수진', '최민호'];
        const avatars = [
            'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
            'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
            'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg'
        ];
        const contents = [
            '오늘 경기 정말 대박이었어요! 🔥',
            '새로운 운동화 구매했습니다 👟',
            '아침 조깅 완료! 상쾌하다 ☀️',
            '헬스장에서 새 기록 달성! 💪',
            '오늘의 운동 루틴 공유합니다 📝'
        ];
        const images = [
            'https://storage.googleapis.com/uxpilot-auth.appspot.com/dce6e55300-6e1d23662ab252d21081.png',
            'https://storage.googleapis.com/uxpilot-auth.appspot.com/98cb1f43e3-528b8a3b540bea1f4652.png',
            'https://storage.googleapis.com/uxpilot-auth.appspot.com/60a72d35f1-09cace140106185bf5cc.png'
        ];

        return Array.from({ length: 10 }, (_, i) => ({
            id: startId + i,
            author: authors[Math.floor(Math.random() * authors.length)],
            avatar: avatars[Math.floor(Math.random() * avatars.length)],
            time: `${Math.floor(Math.random() * 12) + 1}시간 전`,
            content: contents[Math.floor(Math.random() * contents.length)],
            images: [images[Math.floor(Math.random() * images.length)]],
            likes: Math.floor(Math.random() * 200) + 50,
            comments: Math.floor(Math.random() * 50) + 5,
            isLiked: false,
            isFollowing: false
        }));
    };

    // Intersection Observer 설정
    useEffect(() => {
        // 더 많은 게시물 로드
        const loadMorePosts = () => {
            if (isLoading || !hasMore) return;

            setIsLoading(true);

            // API 호출 시뮬레이션 (0.3초 딜레이로 빠르게)
            setTimeout(() => {
                const newPosts = generateNewPosts(posts.length + 1);
                setPosts(prevPosts => [...prevPosts, ...newPosts]);
                setIsLoading(false);

                // 100개 이상이면 더 이상 로드하지 않음 (테스트용)
                if (posts.length >= 100) {
                    setHasMore(false);
                }
            }, 300);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMorePosts();
                }
            },
            { threshold: 0.1, rootMargin: '200px' } // 화면 끝에서 200px 전에 미리 로드
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
    }, [hasMore, isLoading, posts.length]);

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
                            <div className="post-author" onClick={() => navigate(`/user/${post.author}`)}>
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
                                <button className="action-btn" onClick={() => navigate(`/post/${post.id}/comments`)}>
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

                {/* Intersection Observer 타겟 - 마지막 게시물 아래 */}
                <div ref={observerTarget} className="observer-target" />

                {/* 로딩 인디케이터 - 숨김 (백그라운드 로딩) */}
                {isLoading && (
                    <div className="loading-indicator" style={{ opacity: 0, height: 0 }}>
                        <div className="spinner"></div>
                        <p>게시물을 불러오는 중...</p>
                    </div>
                )}

                {/* 더 이상 게시물이 없을 때 */}
                {!hasMore && (
                    <div className="end-message">
                        <p>모든 게시물을 확인했습니다 ✓</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SNSPage;
