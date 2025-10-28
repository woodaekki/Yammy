import { Routes, Route } from 'react-router-dom';
import NavigationBarBottom from './shared/components/NavagationBarBottom'
import NavigationBarTop from './shared/components/NavigationBarTop'
import SNSPage from './sns/components/SNSPage'
import CommentPage from './sns/components/CommentPage'
import UserProfile from './sns/components/UserProfile'
import UsedItem from './useditem/components/UsedItem'
import "./App.css"

function App() {
  return (
    <div className="app-container">
      <NavigationBarTop />
      <Routes>
        <Route path="/" element={<SNSPage />} />
        <Route path="/post/:postId/comments" element={<CommentPage />} />
        <Route path="/user/:userId" element={<UserProfile />} />
        <Route path="/useditem" element={<UsedItem />} />
        <Route path="/prediction" element={<div>승부 예측 페이지 (준비중)</div>} />
        <Route path="/ticket" element={<div>티켓 발급 페이지 (준비중)</div>} />
        <Route path="/mypage" element={<div>마이페이지 (준비중)</div>} />
      </Routes>
      <NavigationBarBottom />
    </div>
  );
}

export default App;
