import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8080/api';
//export const API_BASE_URL = 'http://k13c205.p.ssafy.io:8080/api';

// 공통 Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request 인터셉터: Authorization 헤더 자동 추가
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('[apiClient] 401 error detected, attempting token refresh');
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('accessToken');

      console.log('[apiClient] Tokens exist:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken
      });

      if (refreshToken && accessToken) {
        try {
          console.log('[apiClient] Calling /auth/refresh endpoint');
          // 리프레시 토큰으로 액세스 토큰 재발급 (Header 방식)
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'X-Refresh-Token': refreshToken,
              }
            }
          );

          const newAccessToken = response.data.accessToken;
          console.log('[apiClient] Token refresh successful');

          // 새 토큰 저장
          localStorage.setItem('accessToken', newAccessToken);

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // 리프레시 실패 시 로그아웃 처리
          console.error('[apiClient] 토큰 재발급 실패:', refreshError);
          console.error('[apiClient] Error response:', refreshError.response?.data);
          localStorage.clear();
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // 리프레시 토큰이나 accessToken이 없는 경우
        console.log('[apiClient] Missing tokens, redirecting to login');
        localStorage.clear();
        alert('로그인이 필요한 서비스입니다.');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
