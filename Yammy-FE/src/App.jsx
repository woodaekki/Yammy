import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import NavigationBarBottom from './shared/components/NavigationBarBottom'
import NavigationBarTop from './shared/components/NavigationBarTop'
import AppRouter from './router/AppRouter'
import "./App.css"

function App() {
  const location = useLocation();
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  const hideTopBar = location.pathname === '/mypage' ||
                     location.pathname === '/ticket/create' ||
                     location.pathname.startsWith('/ticket/') ||
                     location.pathname.startsWith('/betting');

  // 페이지 전환 시 스크롤 맨 위로 초기화
  useEffect(() => {
    const scrollToTop = () => {
      // 모든 스크롤 가능한 요소들을 초기화
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }

      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }

      // 모든 스크롤 가능한 요소들 찾아서 초기화
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.scrollTop > 0) {
          el.scrollTop = 0;
        }
      });
    };

    // 즉시 실행
    scrollToTop();

    // 약간의 딜레이 후 다시 실행 (DOM 렌더링 후 확실하게)
    const timer = setTimeout(scrollToTop, 10);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="app-container" ref={containerRef}>
      <div className="app-content-wrapper" ref={contentRef}>
        {!hideTopBar && <NavigationBarTop />}
        <AppRouter />
      </div>
      <NavigationBarBottom />
    </div>
  );
}

export default App;
