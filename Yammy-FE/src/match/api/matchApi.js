import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

// axios 인스턴스 생성
const axiosWithAuth = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// 토큰 자동 추가
axiosWithAuth.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 401 에러시 로그인 페이지로 이동
axiosWithAuth.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// 날짜별 경기 목록 조회
export const getMatchesByDate = async (date) => {
  try {
    // 날짜 형식 변환: 2025-10-31 → 20251031
    const formattedDate = date.replace(/-/g, '');
    
    console.log(`📅 날짜 변환: ${date} → ${formattedDate}`);
    
    const res = await axiosWithAuth.get(`/kbodata/matches/date/${formattedDate}`);
    return res.data;
  } catch (error) {
    console.error(`날짜별 경기 조회 실패 (${date}):`, error);
    throw error;
  }
};

// 특정 경기 상세 정보 조회
export const getMatchDetail = async (matchcode) => {
  try {
    const res = await axiosWithAuth.get(`/kbodata/match/${matchcode}`);
    return res.data;
  } catch (error) {
    console.error(`경기 상세 조회 실패 (${matchcode}):`, error);
    throw error;
  }
};
