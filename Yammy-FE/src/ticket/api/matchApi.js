import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// 토큰 가져오기
const getAuthToken = () => {
    return localStorage.getItem('accessToken');
};

// axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: API_URL,
});

// 요청 인터셉터 - 모든 요청에 토큰 추가
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 최근 경기 목록 조회 (페이징 지원)
export const getRecentMatches = async (page = 0, size = 20) => {
    try {
        const response = await axiosInstance.get('/matches/', {
            params: { page, size }
        });
        return response.data;
    } catch (error) {
        console.error('경기 목록 조회 실패:', error);
        throw error;
    }
};

// 특정 경기 상세 조회
export const getMatchDetail = async (matchcode) => {
    try {
        const response = await axiosInstance.get(`/match/${matchcode}`);
        return response.data;
    } catch (error) {
        console.error('경기 상세 조회 실패:', error);
        throw error;
    }
};

// 특정 날짜의 경기 목록 조회
export const getMatchesByDate = async (date) => {
    try {
        const response = await axiosInstance.get(`/matches/date/${date}`);
        return response.data;
    } catch (error) {
        console.error('날짜별 경기 조회 실패:', error);
        throw error;
    }
};

// 특정 팀의 최근 경기 조회
export const getMatchesByTeam = async (team, page = 0, size = 20) => {
    try {
        const response = await axiosInstance.get(`/team/${team}`, {
            params: { page, size }
        });
        return response.data;
    } catch (error) {
        console.error('팀별 경기 조회 실패:', error);
        throw error;
    }
};

// 날짜 범위로 경기 조회
export const getMatchesByDateRange = async (startDate, endDate, page = 0, size = 20) => {
    try {
        const response = await axiosInstance.get('/range', {
            params: { startDate, endDate, page, size }
        });
        return response.data;
    } catch (error) {
        console.error('기간별 경기 조회 실패:', error);
        throw error;
    }
};

export default {
    getRecentMatches,
    getMatchDetail,
    getMatchesByDate,
    getMatchesByTeam,
    getMatchesByDateRange,
};
