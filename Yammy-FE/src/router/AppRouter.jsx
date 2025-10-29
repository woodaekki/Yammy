import { Routes, Route } from "react-router-dom";
import SNSPage from "../sns/SNSPage";
import CommentPage from "../sns/components/CommentPage";
import UserProfile from "../sns/components/UserProfile";
import UsedItemPage from "../useditem/UsedItemPage";
import UsedItemDetail from "../useditem/components/UsedItemDetail"
import UsedItemEdit from "../useditem/components/UsedItemEdit"
import UsedItemCreate from "../useditem/components/UsedItemCreate"

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/useditem" element={<UsedItemPage />} />
      <Route path="/useditem/:id" element={<UsedItemDetail />} />
      <Route path="/useditem/edit/:id" element={<UsedItemEdit />} />
      <Route path="/useditem/create" element={<UsedItemCreate />} />
      <Route path="/" element={<SNSPage />} />
      <Route path="/post/:postId/comments" element={<CommentPage />} />
      <Route path="/user/:userId" element={<UserProfile />} />
  
    </Routes>
  );
}
