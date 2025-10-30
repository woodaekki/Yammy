import { Routes, Route } from "react-router-dom";
import SNSPage from "../sns/SNSPage";
import CommentPage from "../sns/components/CommentPage";
import UserProfile from "../sns/components/UserProfile";
import UsedItemPage from "../useditem/UsedItemPage";
import UsedItemDetail from "../useditem/components/UsedItemDetail"
import UsedItemEdit from "../useditem/components/UsedItemEdit"
import UsedItemCreate from "../useditem/components/UsedItemCreate"
import UsedItemChat from "../chat/components/UsedItemChat"
import CheckoutPage from "../payment/components/CheckoutPage"
import LoginPage from "../auth/LoginPage";
import SignupPage from "../auth/SignupPage";
import KakaoCallbackPage from "../auth/KakaoCallbackPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <Routes>
      {/* Auth Routes - 로그인 필요 없음 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/kakao/callback" element={<KakaoCallbackPage />} />

      {/* SNS Routes - 로그인 필요 */}
      <Route path="/" element={<ProtectedRoute><SNSPage /></ProtectedRoute>} />
      <Route path="/sns" element={<ProtectedRoute><SNSPage /></ProtectedRoute>} />
      <Route path="/post/:postId/comments" element={<ProtectedRoute><CommentPage /></ProtectedRoute>} />
      <Route path="/user/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

      {/* UsedItem Routes */}
      <Route path="/useditem" element={<UsedItemPage />} />
      <Route path="/useditem/:id" element={<UsedItemDetail />} />
      <Route path="/useditem/edit/:id" element={<UsedItemEdit />} />
      <Route path="/useditem/create" element={<UsedItemCreate />} />
      <Route path="/useditem/:id/chat" element={<UsedItemChat />} />
      <Route path="/useditem/:id/check" element={<CheckoutPage />} />
     
    </Routes>
  );
}
