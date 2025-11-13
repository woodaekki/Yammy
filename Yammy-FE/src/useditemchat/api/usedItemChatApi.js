import apiClient from '../../api/apiClient';

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
    const response = await apiClient.post(`/useditem/chat/${usedItemId}`);
    return response.data;
  },

  /**
   * 내가 참여한 채팅방 목록 조회
   * @returns {Promise} - 채팅방 배열
   */
  getMyChatRooms: async () => {
    const response = await apiClient.get('/useditem/chat/rooms');
    return response.data;
  },

  /**
   * 특정 채팅방 정보 조회
   * @param {string} roomKey - 채팅방 키
   * @returns {Promise} - 채팅방 정보
   */
  getChatRoom: async (roomKey) => {
    const response = await apiClient.get(`/useditem/chat/room/${roomKey}`);
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
      `/useditem/chat/room/${roomKey}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * 채팅방에 텍스트 메시지 전송
   * @param {string} roomKey - 채팅방 키
   * @param {string} message - 전송할 메시지
   * @returns {Promise} - { messageId, imageUrl: null }
   */
  sendTextMessage: async (roomKey, message) => {
    const response = await apiClient.post(
      `/useditem/chat/room/${roomKey}/messages`,
      { message }
    );
    return response.data;
  },

  /**
   * 채팅방 나가기
   * @param {string} roomKey - 채팅방 키
   * @returns {Promise}
   */
  leaveChatRoom: async (roomKey) => {
    await apiClient.delete(`/useditem/chat/room/${roomKey}`);
  },

  
  /**
 * 메시지 읽음 처리
 * @param {string} roomKey - 채팅방 키
 * @returns {Promise}
 */
  markAsRead: async (roomKey) => {
    await apiClient.post(`/useditem/chat/room/${roomKey}/read`);
  },

  /**
   * 전체 읽지 않은 메시지 수 조회
   * @returns {Promise<number>}
   */
  getTotalUnreadCount: async () => {
    const response = await apiClient.get('/useditem/chat/unread-total');
    return response.data.totalUnread;
  },
};