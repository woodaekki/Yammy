import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Axios 인스턴스 생성
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request 인터셉터: Authorization 헤더 자동 추가
authApi.interceptors.request.use(
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

// Response 인터셉터: 401 에러 시 로그인 페이지로 이동
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * 로그인
 */
export const login = async (loginData) => {
  const response = await authApi.post('/auth/login', loginData);
  return response.data;
};

/**
 * 회원가입
 */
export const signup = async (signupData) => {
  const response = await authApi.post('/auth/signup', signupData);
  return response.data;
};

/**
 * 로그아웃
 */
export const logout = async (loginId) => {
  const response = await authApi.post(`/auth/logout?id=${loginId}`);
  return response.data;
};

/**
 * 이메일 인증 코드 발송
 */
export const sendVerificationCode = async (email) => {
  const response = await authApi.post(`/auth/email/send?email=${encodeURIComponent(email)}`);
  return response.data;
};

/**
 * 이메일 인증 코드 확인
 */
export const verifyEmail = async (email, code) => {
  const response = await authApi.post(
    `/auth/email/verify?email=${encodeURIComponent(email)}&code=${code}`
  );
  return response.data;
};

/**
 * 토큰 갱신
 */
export const refreshAccessToken = async (loginId, refreshToken) => {
  const response = await authApi.post('/auth/refresh', {
    id: loginId,
    refreshToken: refreshToken,
  });
  return response.data;
};

/**
 * 비밀번호 변경
 */
export const changePassword = async (passwordData) => {
  const response = await authApi.put('/auth/password', passwordData);
  return response.data;
};

/**
 * 회원 정보 수정
 */
export const updateMember = async (loginId, updateData) => {
  const response = await authApi.put(`/auth/update?id=${loginId}`, updateData);
  return response.data;
};

/**
 * 회원 탈퇴
 */
export const deleteMember = async (loginId) => {
  const response = await authApi.delete(`/auth/delete?id=${loginId}`);
  return response.data;
};

export default authApi;
