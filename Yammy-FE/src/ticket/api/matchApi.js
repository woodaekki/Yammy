import apiClient from "../../api/apiClient";

// 최근 경기 목록 조회 (페이징 지원) - 공개 API
export const getRecentMatches = async (page = 0, size = 20) => {
    try {
        const response = await apiClient.get('/matches', {
            params: { page, size }
        });
        return response.data;
    } catch (error) {
        console.error('경기 목록 조회 실패:', error);
        throw error;
    }
};

// 특정 경기 상세 조회 - 공개 API
export const getMatchDetail = async (matchcode) => {
    try {
        const response = await apiClient.get(`/matches/${matchcode}`);
        return response.data;
    } catch (error) {
        console.error('경기 상세 조회 실패:', error);
        throw error;
    }
};

// 특정 날짜의 경기 목록 조회 - 공개 API
export const getMatchesByDate = async (date) => {
    try {
        const response = await apiClient.get(`/matches/date/${date}`);
        return response.data;
    } catch (error) {
        console.error('날짜별 경기 조회 실패:', error);
        throw error;
    }
};

// 특정 팀의 최근 경기 조회 - 공개 API
export const getMatchesByTeam = async (team, page = 0, size = 20) => {
    try {
        const response = await apiClient.get(`/matches/team/${team}`, {
            params: { page, size }
        });
        return response.data;
    } catch (error) {
        console.error('팀별 경기 조회 실패:', error);
        throw error;
    }
};

// 날짜 범위로 경기 조회 - 공개 API
export const getMatchesByDateRange = async (startDate, endDate, page = 0, size = 20) => {
    try {
        const response = await apiClient.get('/matches/range', {
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
