import axios from 'axios';

const API_URL = 'http://localhost:8080/api/tickets';

// 토큰 가져오기
const getAuthToken = () => {
    return localStorage.getItem('token');
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

// 티켓 목록 조회
export const getTickets = async () => {
    try {
        const response = await axiosInstance.get('/');
        return response.data;
    } catch (error) {
        console.error('티켓 목록 조회 실패:', error);
        throw error;
    }
};

// 티켓 상세 조회
export const getTicket = async (ticketId) => {
    try {
        const response = await axiosInstance.get(`/${ticketId}`);
        return response.data;
    } catch (error) {
        console.error('티켓 조회 실패:', error);
        throw error;
    }
};

// 티켓 생성
export const createTicket = async (ticketData) => {
    try {
        const formData = new FormData();

        // 티켓 정보를 JSON으로 추가
        const ticketInfo = {
            game: ticketData.game,
            date: ticketData.date,
            location: ticketData.location,
            seat: ticketData.seat,
            comment: ticketData.comment,
            type: ticketData.type,
            awayScore: ticketData.awayScore,
            homeScore: ticketData.homeScore,
            review: ticketData.review,
        };

        formData.append('ticket', new Blob([JSON.stringify(ticketInfo)], { type: 'application/json' }));

        // 사진 파일 추가
        if (ticketData.photo) {
            formData.append('photo', ticketData.photo);
        }

        const response = await axiosInstance.post('/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('티켓 생성 실패:', error);
        throw error;
    }
};

// 티켓 수정
export const updateTicket = async (ticketId, ticketData) => {
    try {
        const formData = new FormData();

        const ticketInfo = {
            game: ticketData.game,
            date: ticketData.date,
            location: ticketData.location,
            seat: ticketData.seat,
            comment: ticketData.comment,
            type: ticketData.type,
            awayScore: ticketData.awayScore,
            homeScore: ticketData.homeScore,
            review: ticketData.review,
        };

        formData.append('ticket', new Blob([JSON.stringify(ticketInfo)], { type: 'application/json' }));

        if (ticketData.photo) {
            formData.append('photo', ticketData.photo);
        }

        const response = await axiosInstance.put(`/${ticketId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('티켓 수정 실패:', error);
        throw error;
    }
};

// 티켓 삭제
export const deleteTicket = async (ticketId) => {
    try {
        const response = await axiosInstance.delete(`/${ticketId}`);
        return response.data;
    } catch (error) {
        console.error('티켓 삭제 실패:', error);
        throw error;
    }
};

export default {
    getTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket,
};
