import apiClient from '../../api/apiClient';

/**
 * 채팅방 API
 */
export const chatRoomApi = {

  /**
   * 활성화된 채팅방 목록 조회
   */
  getActiveRooms: async () => {
    const response = await apiClient.get('/chat/rooms');
    return response.data;
  },

  /**
   * 채팅방 생성 (ADMIN만)
   */
  createRoom: async (roomData) => {
    const response = await apiClient.post('/admin/chat-rooms', roomData);
    return response.data;
  },

  /**
   * 채팅방 상태 변경 (ADMIN만)
   */
  updateRoomStatus: async (roomId, status) => {
    const response = await apiClient.patch(
      `/admin/chat-rooms/${roomId}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  },

  /**
   * 채팅방 삭제 (ADMIN만)
   */
  deleteRoom: async (roomId) => {
    const response = await apiClient.delete(`/admin/chat-rooms/${roomId}`);
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
      `/chat/rooms/${roomKey}/images`,
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