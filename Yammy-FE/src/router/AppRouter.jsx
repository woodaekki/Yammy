import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import SNSPage from "../sns/SNSPage"
import CommentPage from "../sns/components/CommentPage"
import UserProfile from "../sns/components/UserProfile"
import UserSearchPage from "../sns/components/UserSearchPage"
import UsedItemPage from "../useditem/UsedItemPage"
import PostCreate from "../sns/components/PostCreate";
import PostEdit from "../sns/components/PostEdit";
import UsedItemDetail from "../useditem/components/UsedItemDetail"
import UsedItemEdit from "../useditem/components/UsedItemEdit"
import UsedItemCreate from "../useditem/components/UsedItemCreate"
import UsedItemChatPage from "../useditemchat/components/UsedItemChatPage"
import UsedItemChatList from "../useditemchat/components/UsedItemChatList"
import MyPoint from "../payment/components/Mypoint"
import MatchResultPage from "../match/MatchResultPage";
import MatchResultDetailPage from "../match/components/MatchResultDetailPage";
import CheckoutPage from "../payment/pages/CheckoutPage"
import SuccessPage from "../payment/pages/SuccessPage"
import FailPage from "../payment/pages/FailPage"
import LoginPage from "../auth/LoginPage"
import SignupPage from "../auth/SignupPage"
import KakaoCallbackPage from "../auth/KakaoCallbackPage"
import ProtectedRoute from "./ProtectedRoute"
import ChangePasswordPage from "../auth/ChangePasswordPage";
import DeleteAccountPage from "../auth/DeleteAccountPage";
import MyPage from "../mypage/MyPage";
import TicketListPage from "../ticket/pages/TicketListPage";
import TicketCreatePage from "../ticket/pages/TicketCreatePage";
import TestChatPage from "../chatgames/pages/TestChatPage";
import ChatGamePage from "../chatgames/pages/ChatGamePage";
import ChatRoomListPage from "../chatgames/pages/ChatRoomListPage";
import AdminChatPage from "../chatgames/pages/AdminChatPage";
import AdminRoute from "./AdminRoute";
import PredictPage from "../predict/PredictPage"; 
import PrecitDetailPage from "../predict/components/BettingPage"
import BankStatement from "../withdrawal/components/BankStatement"
import WithdrawalPage from "../withdrawal/WithdrawalPage"
import WithdrawalHistoryPage from "../withdrawal/WithdrawalHistoryPage"

export default function AppRouter() {
  const location = useLocation();
  return (
    <Routes>
      {/* Auth Routes - 로그인 필요 없음 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/kakao/callback" element={<KakaoCallbackPage />} />

      {/* Auth Routes - 로그인 필요 */}
      <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
      <Route path="/delete-account" element={<ProtectedRoute><DeleteAccountPage /></ProtectedRoute>} />

      {/* MyPage Route - 로그인 필요 */}
      <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />

      {/* SNS Routes - 로그인 필요 */}
      <Route path="/" element={<ProtectedRoute><SNSPage /></ProtectedRoute>} />
      <Route path="/sns" element={<ProtectedRoute><SNSPage /></ProtectedRoute>} />
      <Route path="/post/create" element={<ProtectedRoute><PostCreate /></ProtectedRoute>} />
      <Route path="/post/edit/:postId" element={<ProtectedRoute><PostEdit /></ProtectedRoute>} />
      <Route path="/post/:postId/comments" element={<ProtectedRoute><CommentPage /></ProtectedRoute>} />
      <Route path="/user/:userId" element={<ProtectedRoute><UserProfile key={location.pathname} /></ProtectedRoute>} />
      <Route path="/users/search" element={<ProtectedRoute><UserSearchPage /></ProtectedRoute>} />

       {/* UsedItem Chat Routes */}
      <Route
        path="/useditem/chat/:roomKey"
        element={<UsedItemChatPage key={location.pathname} />}
      />
      <Route path="/chatlist" element={<UsedItemChatList />} />

      {/* UsedItem Routes */}
      <Route path="/useditem" element={<ProtectedRoute><UsedItemPage /></ProtectedRoute>} />
      <Route path="/useditem/:id" element={<ProtectedRoute><UsedItemDetail /></ProtectedRoute>} />
      <Route path="/useditem/edit/:id" element={<ProtectedRoute><UsedItemEdit /></ProtectedRoute>} />
      <Route path="/useditem/create" element={<ProtectedRoute><UsedItemCreate /></ProtectedRoute>} />

      {/* Point Routes */}
      <Route path="/mypoint" element={<ProtectedRoute><MyPoint /></ProtectedRoute>}  />
      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>}  />
      <Route path="/success" element={<ProtectedRoute><SuccessPage /></ProtectedRoute>}  />
      <Route path="/fail" element={<ProtectedRoute><FailPage /></ProtectedRoute>}  />

      {/* Withdrawal Routes */}
      <Route path="/bankstatement" element={<ProtectedRoute><BankStatement /></ProtectedRoute>} />
      <Route path="/withdraw" element={<ProtectedRoute><WithdrawalPage /></ProtectedRoute>} />
      <Route path="/withdraw/history" element={<ProtectedRoute><WithdrawalHistoryPage /></ProtectedRoute>} />

      {/* Ticket Routes - 로그인 필요 */}
      <Route path="/ticket" element={<Navigate to="/ticket/list" replace />} />
      <Route path="/ticket/list" element={<ProtectedRoute><TicketListPage /></ProtectedRoute>} />
      <Route path="/ticket/create" element={<ProtectedRoute><TicketCreatePage /></ProtectedRoute>} />
     
      {/* Match Routes */}
      <Route path="/match" element={<MatchResultPage />} />
      <Route path="/match/:matchcode" element={<MatchResultDetailPage />} />
      
      {/* Predict Routes - 경기 조회는 공개, 배팅은 로그인 필요 */}
      <Route path="/prediction" element={<PredictPage />} />
      <Route path="/prediction/:matchId" element={<PrecitDetailPage />} />

      {/* 임시챗팅방 */}
      <Route path="/test-chat" element={<TestChatPage />} />

      {/* Chat Game Routes*/}
      <Route path="/cheerup" element={<ProtectedRoute><ChatRoomListPage /></ProtectedRoute>} />
      <Route path="/cheerup/:roomKey" element={<ProtectedRoute><ChatGamePage /></ProtectedRoute>} />
      <Route path="/admin/chat" element={<AdminRoute><AdminChatPage /></AdminRoute>} />
    </Routes>
  );
}
