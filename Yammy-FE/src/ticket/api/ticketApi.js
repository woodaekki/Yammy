// src/api/ticketApi.js  (경로는 프로젝트 구조에 맞게)

import apiClient from '../../api/apiClient'; // 혹은 '../api/apiClient' 등 실제 경로에 맞게 수정

// 내 티켓 목록 조회
export const getTickets = async () => {
  try {
    const response = await apiClient.get('/tickets');
    // /api + /tickets => http://localhost:8080/api/tickets
    return response.data;
  } catch (error) {
    console.error('[ticketApi] 티켓 목록 조회 실패:', error);
    throw error;
  }
};

// 특정 사용자의 티켓 목록 조회 (memberId로)
export const getTicketsByUserId = async (memberId) => {
  try {
    const response = await apiClient.get(`/tickets/user/${memberId}`);
    return response.data;
  } catch (error) {
    console.error('[ticketApi] 사용자 티켓 목록 조회 실패:', error);
    throw error;
  }
};

// 티켓 단건 조회
export const getTicket = async (ticketId) => {
  try {
    const response = await apiClient.get(`/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    console.error('[ticketApi] 티켓 조회 실패:', error);
    throw error;
  }
};

// 티켓 생성
export const createTicket = async (ticketData) => {
  try {
    const formData = new FormData();

    const ticketInfo = {
      matchcode: ticketData.matchcode || null,
      game: ticketData.game,
      date: ticketData.date,
      location: ticketData.location,
      seat: ticketData.seat,
      comment: ticketData.comment,
      type: ticketData.type || '야구',
      awayScore: ticketData.awayScore ?? null,
      homeScore: ticketData.homeScore ?? null,
      review: ticketData.review || '',
      team: ticketData.team || null,
    };

    // Multipart JSON 파트
    formData.append(
      'ticket',
      new Blob([JSON.stringify(ticketInfo)], { type: 'application/json' }),
    );

    // 사진 파일(선택)
    if (ticketData.photo) {
      formData.append('photo', ticketData.photo);
    }

    const response = await apiClient.post('/tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('[ticketApi] 티켓 생성 실패:', error);
    throw error;
  }
};

// 티켓 수정
export const updateTicket = async (ticketId, ticketData) => {
  try {
    const formData = new FormData();

    const ticketInfo = {
      matchcode: ticketData.matchcode || null,
      game: ticketData.game,
      date: ticketData.date,
      location: ticketData.location,
      seat: ticketData.seat,
      comment: ticketData.comment,
      type: ticketData.type,
      awayScore: ticketData.awayScore ?? null,
      homeScore: ticketData.homeScore ?? null,
      review: ticketData.review || '',
      team: ticketData.team || null,
    };

    formData.append(
      'ticket',
      new Blob([JSON.stringify(ticketInfo)], { type: 'application/json' }),
    );

    if (ticketData.photo) {
      formData.append('photo', ticketData.photo);
    }

    const response = await apiClient.put(`/tickets/${ticketId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('[ticketApi] 티켓 수정 실패:', error);
    throw error;
  }
};

// 티켓 삭제
export const deleteTicket = async (ticketId) => {
  try {
    const response = await apiClient.delete(`/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    console.error('[ticketApi] 티켓 삭제 실패:', error);
    throw error;
  }
};

export default {
  getTickets,
  getTicketsByUserId,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
};
