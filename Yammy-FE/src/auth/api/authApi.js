import axios from 'axios';
import apiClient, { API_BASE_URL } from '../../api/apiClient';

/**
 * 로그인
 */
export const login = async (loginData) => {
  const response = await apiClient.post('/auth/login', loginData);
  return response.data;
};

/**
 * 회원가입
 */
export const signup = async (signupData) => {
  const response = await apiClient.post('/auth/signup', signupData);
  return response.data;
};

/**
 * 로그아웃
 */
export const logout = async (loginId) => {
  const response = await apiClient.post(`/auth/logout?id=${loginId}`);
  return response.data;
};

/**
 * 이메일 인증 코드 발송
 */
export const sendVerificationCode = async (email) => {
  const response = await apiClient.post(`/auth/email/send?email=${encodeURIComponent(email)}`);
  return response.data;
};

/**
 * 이메일 인증 코드 확인
 */
export const verifyEmail = async (email, code) => {
  const response = await apiClient.post(
    `/auth/email/verify?email=${encodeURIComponent(email)}&code=${code}`
  );
  return response.data;
};

/**
 * 토큰 갱신
 * ⚠️ 주의: 이 함수는 axios를 직접 사용합니다 (apiClient 사용 시 순환 참조 발생)
 */
export const refreshAccessToken = async (accessToken, refreshToken) => {
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
  return response.data;
};

/**
 * 비밀번호 변경
 */
export const changePassword = async (passwordData) => {
  const response = await apiClient.put('/auth/password', passwordData);
  return response.data;
};

/**
 * 회원 정보 수정
 */
export const updateMember = async (updateData) => {
  const response = await apiClient.put('/auth/update', updateData);
  return response.data;
};

/**
 * 회원 탈퇴
 */
export const deleteMember = async () => {
  const response = await apiClient.delete('/auth/delete');
  return response.data;
};