import { Routes, Route, useLocation } from 'react-router-dom';
import NavigationBarBottom from './shared/components/NavigationBarBottom'
import NavigationBarTop from './shared/components/NavigationBarTop'
import AppRouter from './router/AppRouter'
import "./App.css"

function App() {
  const location = useLocation();
  const hideTopBar = location.pathname === '/mypage';

  return (
    <div className="app-container">
      {!hideTopBar && <NavigationBarTop />}
      <AppRouter />
      <NavigationBarBottom />
    </div>
  );
}

export default App;
