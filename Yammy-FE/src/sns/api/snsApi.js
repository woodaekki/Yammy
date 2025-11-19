import apiClient from '../../api/apiClient';

// ==================== 게시글 API ====================

/**
 * S3 Presigned URL 발급 (게시글 이미지 업로드용)
 */
export const getPostPresignedUrls = async (count, contentType = 'image/jpeg') => {
  const response = await apiClient.post(`/posts/presignedUrls?count=${count}&contentType=${contentType}`);
  return response.data;
};

/**
 * 게시글 작성
 */
export const createPost = async (postData) => {
  const response = await apiClient.post('/posts', postData);
  return response.data;
};

/**
 * 게시글 상세 조회
 */
export const getPost = async (postId) => {
  const response = await apiClient.get(`/posts/${postId}`);
  return response.data;
};

/**
 * 전체 피드 조회 (커서 기반 페이징)
 */
export const getAllPosts = async (cursor = null) => {
  const params = cursor ? `?cursor=${cursor}` : '';
  const response = await apiClient.get(`/posts/all${params}`);
  return response.data;
};

/**
 * 내 피드 조회 (나 + 팔로우한 사람들)
 */
export const getMyFeed = async (cursor = null) => {
  const params = cursor ? `?cursor=${cursor}` : '';
  const response = await apiClient.get(`/posts/feed${params}`);
  return response.data;
};

/**
 * 특정 사용자의 게시글 조회
 */
export const getUserPosts = async (userId, cursor = null) => {
  const params = cursor ? `?cursor=${cursor}` : '';
  const response = await apiClient.get(`/posts/user/${userId}${params}`);
  return response.data;
};

/**
 * 게시글 수정 
 */
export const updatePost = async (postId, caption, imageUrls) => {
  const response = await apiClient.patch(`/posts/${postId}`, { caption, imageUrls });
  return response.data;
};

/**
 * 게시글 삭제
 */
export const deletePost = async (postId) => {
  const response = await apiClient.delete(`/posts/${postId}`);
  return response.data;
};

/**
 * 게시글 좋아요 토글
 */
export const togglePostLike = async (postId) => {
  const response = await apiClient.post(`/posts/${postId}/like`);
  return response.data;
};

// ==================== 댓글 API ====================

/**
 * 댓글 작성
 */
export const createComment = async (postId, content) => {
  const response = await apiClient.post(`/comments/post/${postId}`, { content });
  return response.data;
};

/**
 * 댓글 조회 (커서 기반 페이징)
 */
export const getComments = async (postId, cursor = null) => {
  const params = cursor ? `?cursor=${cursor}` : '';
  const response = await apiClient.get(`/comments/post/${postId}${params}`);
  return response.data;
};

/**
 * 댓글 수정
 */
export const updateComment = async (commentId, content) => {
  const response = await apiClient.patch(`/comments/${commentId}`, { content });
  return response.data;
};

/**
 * 댓글 삭제
 */
export const deleteComment = async (commentId) => {
  const response = await apiClient.delete(`/comments/${commentId}`);
  return response.data;
};

/**
 * 댓글 좋아요 토글
 */
export const toggleCommentLike = async (commentId) => {
  const response = await apiClient.post(`/comments/${commentId}/like`);
  return response.data;
};

// ==================== 팔로우 API ====================

/**
 * 팔로우
 */
export const followUser = async (followingId) => {
  try {
    // console.log('팔로우 API 호출:', followingId);
    const response = await apiClient.post(`/follows/${followingId}`);
    // console.log('팔로우 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('팔로우 API 에러:', error.response?.data);
    throw error;
  }
};

/**
 * 언팔로우
 */
export const unfollowUser = async (followingId) => {
  try {
    // console.log('언팔로우 API 호출:', followingId);
    const response = await apiClient.delete(`/follows/${followingId}`);
    // console.log('언팔로우 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('언팔로우 API 에러:', error.response?.data);
    throw error;
  }
};

/**
 * 팔로워 목록 조회
 */
export const getFollowers = async (memberId, page = 0, size = 20) => {
  const response = await apiClient.get(`/follows/followers/${memberId}?page=${page}&size=${size}`);
  return response.data;
};

/**
 * 팔로잉 목록 조회
 */
export const getFollowing = async (memberId, page = 0, size = 20) => {
  const response = await apiClient.get(`/follows/following/${memberId}?page=${page}&size=${size}`);
  return response.data;
};

/**
 * 팔로우 상태 확인
 */
export const getFollowStatus = async (memberId) => {
  const response = await apiClient.get(`/follows/status/${memberId}`);
  return response.data;
};

/**
 * 유저 검색
 */
export const searchUsers = async (query) => {
  const response = await apiClient.get(`/members/search?query=${encodeURIComponent(query)}`);
  return response.data;
};

/**
 * 전체 유저 목록 조회 (가입순)
 */
export const getAllUsers = async (page = 0, size = 50) => {
  const response = await apiClient.get(`/members/all?page=${page}&size=${size}`);
  return response.data;
};

export default apiClient;
