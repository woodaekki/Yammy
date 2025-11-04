import axios from 'axios';

//const API_BASE_URL = 'http://localhost:8080/api/v1';
const API_BASE_URL = 'http://k13c205.p.ssafy.io/api/v1';

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

// Response 인터셉터: 401 에러 시 토큰 재발급 시도
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      const loginId = localStorage.getItem('loginId');

      if (refreshToken && loginId) {
        try {
          // 리프레시 토큰으로 액세스 토큰 재발급
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh?id=${loginId}&refreshToken=${refreshToken}`
          );

          const newAccessToken = response.data.accessToken;

          // 새 토큰 저장
          localStorage.setItem('accessToken', newAccessToken);

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return authApi(originalRequest);
        } catch (refreshError) {
          // 리프레시 실패 시 로그아웃 처리
          console.error('토큰 재발급 실패:', refreshError);
          localStorage.clear();
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // 리프레시 토큰이나 loginId가 없는 경우
        localStorage.clear();
        alert('로그인이 필요한 서비스입니다.');
        window.location.href = '/login';
      }
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
