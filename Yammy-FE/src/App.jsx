import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import NavigationBarBottom from './shared/components/NavigationBarBottom'
import NavigationBarTop from './shared/components/NavigationBarTop'
import AppRouter from './router/AppRouter'
import "./App.css"

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideTopBar = location.pathname === '/mypage' ||
                     location.pathname === '/ticket/create' ||
                     location.pathname.startsWith('/ticket/') ||
                     location.pathname.startsWith('/betting');

  // 스와이프 기능을 위한 메뉴 정의
  const menuRoutes = [
    '/',
    '/useditem',
    '/prediction',
    '/cheerup',
    '/ticket',
    '/mypage'
  ];

  // 터치 이벤트 및 애니메이션 관리
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const touchStartTime = useRef(0);
  const contentRef = useRef(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState('');
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = (e) => {
    // 스크롤 가능한 엘리먼트 확인 (input, textarea 등)
    const target = e.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' ||
        target.closest('.scrollable') || target.closest('[data-no-swipe]')) {
      return;
    }

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    setIsTransitioning(false);
    setIsSwiping(false);
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === 0) return;

    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;

    const diffX = touchEndX.current - touchStartX.current;
    const diffY = touchEndY.current - touchStartY.current;

    // 가로 이동이 세로 이동보다 크면 스와이프로 판단
    if (!isSwiping && Math.abs(diffX) > 10) {
      if (Math.abs(diffX) > Math.abs(diffY) * 1.5) {
        setIsSwiping(true);
      }
    }

    // 스와이프 중일 때만 실시간 화면 이동
    if (isSwiping) {
      const resistance = 0.4; // 저항 계수
      setSwipeOffset(diffX * resistance);

      // 가로 스와이프 중에는 기본 스크롤 방지
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === 0) return;

    const swipeDistanceX = touchStartX.current - touchEndX.current;
    const swipeDistanceY = touchStartY.current - touchEndY.current;
    const swipeTime = Date.now() - touchStartTime.current;
    const swipeVelocity = Math.abs(swipeDistanceX) / swipeTime; // px/ms

    const minSwipeDistance = 100; // 최소 스와이프 거리
    const minSwipeVelocity = 0.3; // 최소 스와이프 속도

    // 세로 스크롤이 더 크면 스와이프 무시
    if (Math.abs(swipeDistanceY) > Math.abs(swipeDistanceX)) {
      setSwipeOffset(0);
      touchStartX.current = 0;
      touchStartY.current = 0;
      touchEndX.current = 0;
      touchEndY.current = 0;
      setIsSwiping(false);
      return;
    }

    // 스와이프 거리와 속도 체크
    if (isSwiping && (Math.abs(swipeDistanceX) > minSwipeDistance || swipeVelocity > minSwipeVelocity)) {
      // 현재 경로가 어떤 메뉴에 속하는지 찾기
      let currentIndex = menuRoutes.findIndex(route => {
        if (route === '/') {
          return location.pathname === '/';
        }
        return location.pathname.startsWith(route);
      });

      if (currentIndex === -1) currentIndex = 0;

      // 왼쪽 스와이프 (다음 메뉴)
      if (swipeDistanceX > 0 && currentIndex < menuRoutes.length - 1) {
        setSlideDirection('slide-left');
        setIsTransitioning(true);
        setTimeout(() => {
          navigate(menuRoutes[currentIndex + 1]);
        }, 50);
      }
      // 오른쪽 스와이프 (이전 메뉴)
      else if (swipeDistanceX < 0 && currentIndex > 0) {
        setSlideDirection('slide-right');
        setIsTransitioning(true);
        setTimeout(() => {
          navigate(menuRoutes[currentIndex - 1]);
        }, 50);
      }
    }

    // 리셋
    setSwipeOffset(0);
    touchStartX.current = 0;
    touchStartY.current = 0;
    touchEndX.current = 0;
    touchEndY.current = 0;
    setIsSwiping(false);
  };

  // 페이지 전환 후 애니메이션 클래스 제거
  useEffect(() => {
    if (slideDirection) {
      const timer = setTimeout(() => {
        setSlideDirection('');
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, slideDirection]);

  return (
    <div className={`app-container ${slideDirection}`}>
      <div
        className="app-content-wrapper"
        ref={contentRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: !isTransitioning ? `translateX(${swipeOffset}px)` : 'none',
          transition: isTransitioning ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {!hideTopBar && <NavigationBarTop />}
        <AppRouter />
      </div>
      <NavigationBarBottom />
    </div>
  );
}

export default App;
