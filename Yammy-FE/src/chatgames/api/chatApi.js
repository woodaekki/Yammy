import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (JWT 토큰 자동 추가)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // 또는 zustand store에서
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 채팅방 API
 */
export const chatRoomApi = {

  /**
   * 활성화된 채팅방 목록 조회
   */
  getActiveRooms: async () => {
    const response = await apiClient.get('/api/chat/rooms');
    return response.data;
  },

  /**
   * 채팅방 생성 (ADMIN만)
   */
  createRoom: async (roomData) => {
    const response = await apiClient.post('/api/admin/chat-rooms', roomData);
    return response.data;
  },

  /**
   * 채팅방 상태 변경 (ADMIN만)
   */
  updateRoomStatus: async (roomId, status) => {
    const response = await apiClient.patch(
      `/api/admin/chat-rooms/${roomId}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  },

  /**
   * 채팅방 삭제 (ADMIN만)
   */
  deleteRoom: async (roomId) => {
    const response = await apiClient.delete(`/api/admin/chat-rooms/${roomId}`);
    return response.data;
  },
};

/**
 * 채팅 메시지 API
 */
export const chatMessageApi = {
  /**
   * 이미지 업로드
   */
  uploadImage: async (roomKey, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      `/api/chat/rooms/${roomKey}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data; // { messageId, imageUrl }
  },
};