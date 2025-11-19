import { useState } from 'react';
import { chatRoomApi } from '../api/chatApi';
import "../styles/RoomListItem.css";

/**
 * 관리자용 채팅방 목록 아이템
 */
export default function RoomListItem({ room, onUpdate, onDelete }) {
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleString('ko-KR', options);
  };

  const handleStatusChange = async (newStatus) => {
    if (loading) return;
    const confirmMessage = 
      newStatus === 'ACTIVE' ? '채팅방을 활성화하시겠습니까?' :
      newStatus === 'CANCELED' ? '채팅방을 취소하시겠습니까?' :
      '채팅방을 DRAFT 상태로 변경하시겠습니까?';
    if (!confirm(confirmMessage)) return;

    try {
      setLoading(true);
      await chatRoomApi.updateRoomStatus(room.id, newStatus);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('상태 변경 실패: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (loading) return;
    if (!confirm(`"${room.name}" 채팅방을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) return;

    try {
      setLoading(true);
      await chatRoomApi.deleteRoom(room.id);
      if (onDelete) onDelete(room.id);
    } catch (err) {
      alert('삭제 실패: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    DRAFT: { text: '준비 중', className: 'status-draft' },
    ACTIVE: { text: '진행 중', className: 'status-active' },
    CANCELED: { text: '취소됨', className: 'status-canceled' }
  };

  const status = statusConfig[room.status] || statusConfig.DRAFT;

  return (
    <div className="room-item">
      <div className="room-header">
        <div className="room-info">
          <h3 className="room-title">{room.name}</h3>
          <p className="room-teams">{room.homeTeam} vs {room.awayTeam}</p>
          <p className="room-key">Room Key: <span>{room.roomKey}</span></p>
        </div>
        <span className={`room-status ${status.className}`}>{status.text}</span>
      </div>

      <div className="room-meta">
        <div className="room-date">{formatDate(room.startAt)}</div>
        {room.doubleHeader && <div className="room-double">더블헤더</div>}
      </div>

      <div className="room-actions">
        {room.status === 'DRAFT' && (
          <button onClick={() => handleStatusChange('ACTIVE')} disabled={loading} className="btn btn-active">활성화</button>
        )}
        {room.status === 'ACTIVE' && (
          <>
            <button onClick={() => handleStatusChange('DRAFT')} disabled={loading} className="btn btn-gray">비활성화</button>
            <button onClick={() => handleStatusChange('CANCELED')} disabled={loading} className="btn btn-orange">취소</button>
          </>
        )}
        {room.status === 'CANCELED' && (
          <button onClick={() => handleStatusChange('DRAFT')} disabled={loading} className="btn btn-gray">DRAFT로 변경</button>
        )}
        <button onClick={handleDelete} disabled={loading} className="btn btn-red">삭제</button>
      </div>
    </div>
  );
}
