import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
// const API_BASE_URL = 'http://k13c205.p.ssafy.io/api/v1';

/**
 * 카카오 로그인 처리 (인증 코드를 백엔드로 전송)
 */
export const loginWithKakao = async (code) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/oauth/kakao`, {
      params: { code },
    });
    return response.data;
  } catch (error) {
    console.error('Kakao login error:', error);
    throw error;
  }
};

/**
 * 카카오 회원 탈퇴
 */
export const withdrawKakao = async (code) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/oauth/kakao/withdraw`, null, {
      params: { code },
    });
    return response.data;
  } catch (error) {
    console.error('Kakao withdraw error:', error);
    throw error;
  }
};
