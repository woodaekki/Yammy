import apiClient from "../../api/apiClient";

// 날짜별 경기 목록 조회
export const getMatchesByDate = async (date) => {
  try {
    // 날짜 형식 변환: 2025-10-31 → 20251031
    const formattedDate = date.replace(/-/g, '');

    console.log(`📅 날짜 변환: ${date} → ${formattedDate}`);

    const res = await apiClient.get(`/kbodata/matches/date/${formattedDate}`);
    return res.data;
  } catch (error) {
    console.error(`날짜별 경기 조회 실패 (${date}):`, error);
    throw error;
  }
};

// 특정 경기 상세 정보 조회
export const getMatchDetail = async (matchcode) => {
  try {
    const res = await apiClient.get(`/kbodata/match/${matchcode}`);
    return res.data;
  } catch (error) {
    console.error(`경기 상세 조회 실패 (${matchcode}):`, error);
    throw error;
  }
};
