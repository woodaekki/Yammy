import apiClient from "../../api/apiClient";

// 날짜별 경기 목록 조회
export const getMatchesByDate = async (date) => {
  try {
    const formattedDate = date.replace(/-/g, '');
    const res = await apiClient.get(`/kbodata/matches/date/${formattedDate}`);
    return res.data;
  } catch (error) {
    console.error('[matchApi] Error fetching matches by date:', {
      date: formattedDate,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

export const getMatchDetail = async (matchcode) => {
  try {
    const res = await apiClient.get(`/kbodata/match/${matchcode}`);
    return res.data;
  } catch (error) {
    console.error('[matchApi] Error fetching match detail:', {
      matchcode,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};
