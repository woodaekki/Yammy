// Kakao OAuth 관련 설정
export const KAKAO_CONFIG = {
  REST_API_KEY: import.meta.env.VITE_KAKAO_REST_API_KEY || 'your_kakao_rest_api_key_here',
  REDIRECT_URI: `${window.location.origin}/kakao/callback`,
};

// Kakao Auth URL 생성 함수
export const getKakaoAuthUrl = () => {
  const { REST_API_KEY, REDIRECT_URI } = KAKAO_CONFIG;
  return `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
};
