import axios from 'axios';
import apiClient, { API_BASE_URL } from '../../api/apiClient';

/**
 * 카카오 로그인 처리 (인증 코드를 백엔드로 전송)
 * ⚠️ 주의: OAuth 콜백 단계이므로 axios 직접 사용 (토큰 없는 상태)
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
 * ✅ 인증이 필요한 API이므로 apiClient 사용
 */
export const withdrawKakao = async (code) => {
  try {
    const response = await apiClient.post('/oauth/kakao/withdraw', null, {
      params: { code },
    });
    return response.data;
  } catch (error) {
    console.error('Kakao withdraw error:', error);
    throw error;
  }
};