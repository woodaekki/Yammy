import axios from "axios";
import apiClient from "../../api/apiClient"; // 인증이 필요한 API용

// 인증이 불필요한 공개 API용 인스턴스 (기존 apiClient의 baseURL 재사용)
const publicApi = axios.create({
  baseURL: apiClient.defaults.baseURL,
  headers: { "Content-Type": "application/json" },
});

/**
 * 특정 날짜의 경기 목록 조회
 * @param {string} date - 경기 날짜 (YYYYMMDD 형식, 예: "20251110")
 * @returns {Promise} 경기 목록 데이터
 */
export const getMatchesByDate = async (date) => {
  try {
    const response = await publicApi.get(`/predict/matches`, {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching matches by date:', error.message);
    throw error;
  }
};

/**
 * 오늘 날짜의 경기 목록 조회
 * @returns {Promise} 오늘 경기 목록 데이터
 */
export const getTodayMatches = async () => {
  try {
    const today = new Date();
    const formattedDate = today.getFullYear() +
                         String(today.getMonth() + 1).padStart(2, '0') +
                         String(today.getDate()).padStart(2, '0');
    return await getMatchesByDate(formattedDate);
  } catch (error) {
    console.error('Error fetching today matches:', error.message);
    throw error;
  }
};

/**
 * 특정 날짜 문자열을 YYYYMMDD 형식으로 변환
 * @param {string} dateString - 날짜 문자열 (예: "2025-11-10")
 * @returns {string} YYYYMMDD 형식 날짜
 */
export const formatDateForAPI = (dateString) => {
  return dateString.replace(/-/g, '');
};

// ===========================================
// 배팅 관련 API (인증 필요)
// ===========================================

/**
 * 배팅 생성
 * @param {Object} bettingData - 배팅 데이터
 * @param {number} bettingData.matchId - 경기 ID
 * @param {number} bettingData.selectedTeam - 선택된 팀 (0: 홈팀, 1: 원정팀)
 * @param {number} bettingData.betAmount - 배팅 금액
 * @param {number} bettingData.expectedReturn - 예상 수익
 * @returns {Promise} 배팅 결과
 */
export const createBetting = async (bettingData) => {
  try {
    const response = await apiClient.post('/predict/betting', {
      predictedMatchId: bettingData.matchId,
      predict: bettingData.selectedTeam,
      batAmount: bettingData.betAmount
    });
    return response.data;
  } catch (error) {
    console.error('Betting creation error:', error.message);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.status === 400) {
      throw new Error('입력 데이터가 올바르지 않습니다.');
    } else if (error.response?.status === 401) {
      throw new Error('로그인이 필요합니다.');
    } else if (error.response?.status === 403) {
      throw new Error('배팅 권한이 없습니다.');
    } else {
      throw new Error('배팅 처리 중 오류가 발생했습니다.');
    }
  }
};

/**
 * 사용자의 배팅 내역 조회
 * @param {Object} params - 조회 매개변수
 * @param {number} params.page - 페이지 번호 (기본: 0)
 * @param {number} params.size - 페이지 크기 (기본: 10)
 * @param {string} params.status - 배팅 상태 ('PENDING', 'WIN', 'LOSE', 'CANCELLED')
 * @returns {Promise} 배팅 내역 데이터
 */
export const getUserBettings = async (params = {}) => {
  try {
    const { page = 0, size = 10, status } = params;
    const queryParams = { page, size };
    if (status) queryParams.status = status;
    const response = await apiClient.get('/predict/betting/my', {
      params: queryParams
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user bettings:', error.message);
    throw error;
  }
};

/**
 * 사용자의 회원정보 조회 (팬심 포함)
 * @returns {Promise} 회원정보 데이터
 */
export const getMemberInfo = async () => {
  try {
    const response = await apiClient.get('/auth/myinfo');
    return response.data;
  } catch (error) {
    console.error('Error fetching member info:', error.message);
    throw error;
  }
};

/**
 * 배팅 취소 (경기 시작 전에만 가능)
 * @param {number} bettingId - 배팅 ID
 * @returns {Promise} 취소 결과
 */
export const cancelBetting = async (bettingId) => {
  try {
    const response = await apiClient.delete(`/predict/betting/${bettingId}`);
    return response.data;
  } catch (error) {
    console.error('Betting cancellation error:', error.message);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.status === 400) {
      throw new Error('취소할 수 없는 배팅입니다.');
    } else {
      throw new Error('배팅 취소 중 오류가 발생했습니다.');
    }
  }
};

/**
 * 관리자: 경기 정산 (경기 결과 입력 및 배팅 정산)
 * @param {Array} settlementData - 정산 데이터
 * @param {number} settlementData[].matchId - 경기 ID
 * @param {number} settlementData[].result - 경기 결과 (0: 홈팀 승, 1: 원정팀 승)
 * @returns {Promise} 정산 결과
 */
export const settleMatches = async (settlementData) => {
  try {
    const response = await apiClient.post('/predict/admin/settle', settlementData);
    return response.data;
  } catch (error) {
    console.error('Settlement error:', error.message);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.status === 403) {
      throw new Error('관리자 권한이 필요합니다.');
    } else if (error.response?.status === 400) {
      throw new Error('잘못된 정산 데이터입니다.');
    } else {
      throw new Error('정산 처리 중 오류가 발생했습니다.');
    }
  }
};

export default {
  getMatchesByDate,
  getTodayMatches,
  formatDateForAPI,
  createBetting,
  getUserBettings,
  getMemberInfo,
  cancelBetting,
  settleMatches
};