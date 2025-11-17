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

    const hideTopBar =
    location.pathname === '/mypage' ||
    location.pathname === '/ticket/create' ||
    location.pathname.startsWith('/ticket/') ||
    location.pathname.startsWith('/betting') ||
    location.pathname === '/' ||
    location.pathname === '/sns' ||
    location.pathname.startsWith('/user/') ||
    location.pathname.startsWith('/users/');

  const hasTopBar = !hideTopBar;

  // ?�이지 ?�환 ???�크�?�??�로 초기??
  useEffect(() => {
    const scrollToTop = () => {
      // 모든 ?�크�?가?�한 ?�소?�을 초기??
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }

      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }

      // 모든 ?�크�?가?�한 ?�소??찾아??초기??
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.scrollTop > 0) {
          el.scrollTop = 0;
        }
      });
    };

    // 즉시 ?�행
    scrollToTop();

    // ?�간???�레?????�시 ?�행 (DOM ?�더�????�실?�게)
    const timer = setTimeout(scrollToTop, 10);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="app-container" ref={containerRef}>
      <div className={`app-content-wrapper${hasTopBar ? " with-topbar" : ""}`} ref={contentRef}>
        {!hideTopBar && <NavigationBarTop />}
        <AppRouter />
      </div>
      <NavigationBarBottom />
    </div>
  );
}

export default App;