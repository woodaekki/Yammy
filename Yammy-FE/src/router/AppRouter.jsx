import { Routes, Route } from "react-router-dom"
import SNSPage from "../sns/SNSPage"
import CommentPage from "../sns/components/CommentPage"
import UserProfile from "../sns/components/UserProfile"
import UsedItemPage from "../useditem/UsedItemPage"
import PostCreate from "../sns/components/PostCreate";
import UsedItemDetail from "../useditem/components/UsedItemDetail"
import UsedItemEdit from "../useditem/components/UsedItemEdit"
import UsedItemCreate from "../useditem/components/UsedItemCreate"
import UsedItemChat from "../chat/components/UsedItemChat"
import MyPoint from "../payment/components/Mypoint"
import CheckoutPage from "../payment/pages/CheckoutPage"
import SuccessPage from "../payment/pages/SuccessPage"
import FailPage from "../payment/pages/FailPage"
import LoginPage from "../auth/LoginPage"
import SignupPage from "../auth/SignupPage"
import KakaoCallbackPage from "../auth/KakaoCallbackPage"
import ProtectedRoute from "./ProtectedRoute"
import ChangePasswordPage from "../auth/ChangePasswordPage";
import DeleteAccountPage from "../auth/DeleteAccountPage";

export default function AppRouter() {
  return (
    <Routes>
      {/* Auth Routes - 로그인 필요 없음 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/kakao/callback" element={<KakaoCallbackPage />} />

      {/* Auth Routes - 로그인 필요 */}
      <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
      <Route path="/delete-account" element={<ProtectedRoute><DeleteAccountPage /></ProtectedRoute>} />

      {/* SNS Routes - 로그인 필요 */}
      <Route path="/" element={<ProtectedRoute><SNSPage /></ProtectedRoute>} />
      <Route path="/sns" element={<ProtectedRoute><SNSPage /></ProtectedRoute>} />
      <Route path="/post/create" element={<ProtectedRoute><PostCreate /></ProtectedRoute>} />
      <Route path="/post/:postId/comments" element={<ProtectedRoute><CommentPage /></ProtectedRoute>} />
      <Route path="/user/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

      {/* UsedItem Routes */}
      <Route path="/useditem" element={<UsedItemPage />} />
      <Route path="/useditem/:id" element={<UsedItemDetail />} />
      <Route path="/useditem/edit/:id" element={<UsedItemEdit />} />
      <Route path="/useditem/create" element={<UsedItemCreate />} />
      <Route path="/useditem/:id/chat" element={<UsedItemChat />} />
      
      {/* Point Routes */}
      <Route path="/mypoint" element={<MyPoint />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/fail" element={<FailPage />} />
     
    </Routes>
  );
}
