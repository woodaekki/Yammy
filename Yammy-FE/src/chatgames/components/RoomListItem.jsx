import { useState } from 'react';
import { chatRoomApi } from '../api/chatApi';

/**
 * 관리자용 채팅방 목록 아이템
 */
export default function RoomListItem({ room, onUpdate, onDelete }) {
  const [loading, setLoading] = useState(false);

  // 날짜 포맷팅
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

  // 상태 변경
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
      console.log(`✅ 상태 변경 성공: ${room.id} → ${newStatus}`);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('❌ 상태 변경 실패:', err);
      alert('상태 변경 실패: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (loading) return;

    if (!confirm(`"${room.name}" 채팅방을 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      setLoading(true);
      await chatRoomApi.deleteRoom(room.id);
      console.log('✅ 삭제 성공:', room.id);
      
      if (onDelete) {
        onDelete(room.id);
      }
    } catch (err) {
      console.error('❌ 삭제 실패:', err);
      alert('삭제 실패: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // 상태별 스타일
  const statusConfig = {
    DRAFT: { 
      text: '준비 중', 
      bgColor: 'bg-gray-100', 
      textColor: 'text-gray-700',
      icon: '⏳'
    },
    ACTIVE: { 
      text: '진행 중', 
      bgColor: 'bg-green-100', 
      textColor: 'text-green-700',
      icon: '●'
    },
    CANCELED: { 
      text: '취소됨', 
      bgColor: 'bg-red-100', 
      textColor: 'text-red-700',
      icon: '✕'
    }
  };

  const status = statusConfig[room.status] || statusConfig.DRAFT;

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">{room.name}</h3>
          <p className="text-sm text-gray-600">
            {room.homeTeam} vs {room.awayTeam}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Room Key: <code className="bg-gray-100 px-2 py-0.5 rounded">{room.roomKey}</code>
          </p>
        </div>

        {/* 상태 배지 */}
        <span className={`${status.bgColor} ${status.textColor} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
          <span>{status.icon}</span>
          <span>{status.text}</span>
        </span>
      </div>

      {/* 정보 */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <div>
          📅 {formatDate(room.startAt)}
        </div>
        {room.doubleHeader && (
          <div className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">
            🔄 더블헤더
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2 flex-wrap">
        {/* 상태 변경 버튼 */}
        {room.status === 'DRAFT' && (
          <button
            onClick={() => handleStatusChange('ACTIVE')}
            disabled={loading}
            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
          >
            활성화
          </button>
        )}
        
        {room.status === 'ACTIVE' && (
          <>
            <button
              onClick={() => handleStatusChange('DRAFT')}
              disabled={loading}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
            >
              비활성화
            </button>
            <button
              onClick={() => handleStatusChange('CANCELED')}
              disabled={loading}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
            >
              취소
            </button>
          </>
        )}

        {room.status === 'CANCELED' && (
          <button
            onClick={() => handleStatusChange('DRAFT')}
            disabled={loading}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
          >
            DRAFT로 변경
          </button>
        )}

        {/* 삭제 버튼 */}
        <button
          onClick={handleDelete}
          disabled={loading}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  );
}