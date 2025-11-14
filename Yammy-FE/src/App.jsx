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

  // ?˜ì´ì§€ ?„í™˜ ???¤í¬ë¡?ë§??„ë¡œ ì´ˆê¸°??
  useEffect(() => {
    const scrollToTop = () => {
      // ëª¨ë“  ?¤í¬ë¡?ê°€?¥í•œ ?”ì†Œ?¤ì„ ì´ˆê¸°??
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }

      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }

      // ëª¨ë“  ?¤í¬ë¡?ê°€?¥í•œ ?”ì†Œ??ì°¾ì•„??ì´ˆê¸°??
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.scrollTop > 0) {
          el.scrollTop = 0;
        }
      });
    };

    // ì¦‰ì‹œ ?¤í–‰
    scrollToTop();

    // ?½ê°„???œë ˆ?????¤ì‹œ ?¤í–‰ (DOM ?Œë”ë§????•ì‹¤?˜ê²Œ)
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