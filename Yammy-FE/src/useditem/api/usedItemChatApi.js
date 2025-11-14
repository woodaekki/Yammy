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
    const token = localStorage.getItem('accessToken');
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
 * 중고거래 채팅방 API
 */
export const usedItemChatApi = {

  /**
   * 채팅방 생성 또는 기존 방 입장
   * @param {number} usedItemId - 중고거래 물품 ID
   * @returns {Promise} - { roomKey, usedItemId, sellerId, buyerId, status, createdAt }
   */
  createOrEnterChatRoom: async (usedItemId) => {
    const response = await apiClient.post(`/api/useditem/chat/${usedItemId}`);
    return response.data;
  },

  /**
   * 내가 참여한 채팅방 목록 조회
   * @returns {Promise} - 채팅방 배열
   */
  getMyChatRooms: async () => {
    const response = await apiClient.get('/api/useditem/chat/rooms');
    return response.data;
  },

  /**
   * 특정 채팅방 정보 조회
   * @param {string} roomKey - 채팅방 키
   * @returns {Promise} - 채팅방 정보
   */
  getChatRoom: async (roomKey) => {
    const response = await apiClient.get(`/api/useditem/chat/room/${roomKey}`);
    return response.data;
  },

  /**
   * 채팅방에 이미지 업로드
   * @param {string} roomKey - 채팅방 키
   * @param {File} file - 업로드할 이미지 파일
   * @returns {Promise} - { messageId, imageUrl }
   */
  uploadImage: async (roomKey, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      `/api/useditem/chat/room/${roomKey}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data; // { messageId, imageUrl }
  },

  /**
   * 채팅방에 텍스트 메시지 전송
   * @param {string} roomKey - 채팅방 키
   * @param {string} message - 전송할 메시지
   * @returns {Promise} - { messageId, imageUrl: null }
   */
  sendTextMessage: async (roomKey, message) => {
    const response = await apiClient.post(
      `/api/useditem/chat/room/${roomKey}/messages`,
      { message }
    );
    return response.data; // { messageId, imageUrl: null }
  },
};
