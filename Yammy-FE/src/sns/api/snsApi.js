import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Axios 인스턴스 생성
const snsApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request 인터셉터: Authorization 헤더 자동 추가
snsApi.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response 인터셉터: 401 에러 시 처리
snsApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      alert('로그인이 필요한 서비스입니다.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== 게시글 API ====================

/**
 * S3 Presigned URL 발급 (게시글 이미지 업로드용)
 */
export const getPostPresignedUrls = async (count, contentType = 'image/jpeg') => {
  const response = await snsApi.post(`/posts/presignedUrls?count=${count}&contentType=${contentType}`);
  return response.data;
};

/**
 * 게시글 작성
 */
export const createPost = async (postData) => {
  const response = await snsApi.post('/posts', postData);
  return response.data;
};

/**
 * 게시글 상세 조회
 */
export const getPost = async (postId) => {
  const response = await snsApi.get(`/posts/${postId}`);
  return response.data;
};

/**
 * 전체 피드 조회 (커서 기반 페이징)
 */
export const getAllPosts = async (cursor = null) => {
  const params = cursor ? `?cursor=${cursor}` : '';
  const response = await snsApi.get(`/posts/all${params}`);
  return response.data;
};

/**
 * 내 피드 조회 (나 + 팔로우한 사람들)
 */
export const getMyFeed = async (cursor = null) => {
  const params = cursor ? `?cursor=${cursor}` : '';
  const response = await snsApi.get(`/posts/feed${params}`);
  return response.data;
};

/**
 * 특정 사용자의 게시글 조회
 */
export const getUserPosts = async (userId, cursor = null) => {
  const params = cursor ? `?cursor=${cursor}` : '';
  const response = await snsApi.get(`/posts/user/${userId}${params}`);
  return response.data;
};

/**
 * 게시글 수정 (캡션만)
 */
export const updatePost = async (postId, caption) => {
  const response = await snsApi.patch(`/posts/${postId}`, { caption });
  return response.data;
};

/**
 * 게시글 삭제
 */
export const deletePost = async (postId) => {
  const response = await snsApi.delete(`/posts/${postId}`);
  return response.data;
};

/**
 * 게시글 좋아요 토글
 */
export const togglePostLike = async (postId) => {
  const response = await snsApi.post(`/posts/${postId}/like`);
  return response.data;
};

// ==================== 댓글 API ====================

/**
 * 댓글 작성
 */
export const createComment = async (postId, content) => {
  const response = await snsApi.post(`/comments/post/${postId}`, { content });
  return response.data;
};

/**
 * 댓글 조회 (커서 기반 페이징)
 */
export const getComments = async (postId, cursor = null) => {
  const params = cursor ? `?cursor=${cursor}` : '';
  const response = await snsApi.get(`/comments/post/${postId}${params}`);
  return response.data;
};

/**
 * 댓글 수정
 */
export const updateComment = async (commentId, content) => {
  const response = await snsApi.patch(`/comments/${commentId}`, { content });
  return response.data;
};

/**
 * 댓글 삭제
 */
export const deleteComment = async (commentId) => {
  const response = await snsApi.delete(`/comments/${commentId}`);
  return response.data;
};

/**
 * 댓글 좋아요 토글
 */
export const toggleCommentLike = async (commentId) => {
  const response = await snsApi.post(`/comments/${commentId}/like`);
  return response.data;
};

// ==================== 팔로우 API ====================

/**
 * 팔로우
 */
export const followUser = async (followingId) => {
  const response = await snsApi.post(`/follows/${followingId}`);
  return response.data;
};

/**
 * 언팔로우
 */
export const unfollowUser = async (followingId) => {
  const response = await snsApi.delete(`/follows/${followingId}`);
  return response.data;
};

/**
 * 팔로워 목록 조회
 */
export const getFollowers = async (memberId, page = 0, size = 20) => {
  const response = await snsApi.get(`/follows/followers/${memberId}?page=${page}&size=${size}`);
  return response.data;
};

/**
 * 팔로잉 목록 조회
 */
export const getFollowing = async (memberId, page = 0, size = 20) => {
  const response = await snsApi.get(`/follows/following/${memberId}?page=${page}&size=${size}`);
  return response.data;
};

/**
 * 팔로우 상태 확인
 */
export const getFollowStatus = async (memberId) => {
  const response = await snsApi.get(`/follows/status/${memberId}`);
  return response.data;
};

export default snsApi;
