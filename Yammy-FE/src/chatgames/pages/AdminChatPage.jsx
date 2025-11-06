import { useState, useEffect } from 'react';
import { chatRoomApi } from '../api/chatApi';
import RoomCreateForm from '../components/RoomCreateForm';
import RoomListItem from '../components/RoomListItem';
import "../styles/AdminChatPage.css";

/**
 * 관리자 채팅방 관리 페이지
 */
export default function AdminChatPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // 채팅방 목록 가져오기
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await chatRoomApi.getActiveRooms();
      console.log('✅ 채팅방 목록:', data);
      setRooms(data);
      setError(null);
    } catch (err) {
      console.error('❌ 채팅방 목록 조회 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = (newRoom) => {
    console.log('✅ 채팅방 생성 완료:', newRoom);
    setShowCreateForm(false);
    fetchRooms();
  };

  const handleDelete = (deletedId) => {
    setRooms(prev => prev.filter(room => room.id !== deletedId));
  };

  if (loading && rooms.length === 0) {
    return (
      <div className="admin-chat-page flex-center">
        <div className="admin-chat-loading">
          <div className="admin-chat-spinner"></div>
          <p>데이터 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-chat-page">
      {/* 헤더 */}
      <div className="admin-chat-header">
        <div className="admin-chat-header-inner">
          <div>
            <h1 className="admin-chat-title">채팅방 관리</h1>
            <p className="admin-chat-subtitle">채팅방을 생성하고 관리하세요</p>
          </div>

          {/* 새 채팅방 버튼 */}
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="admin-chat-toggle-btn"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            {showCreateForm ? '취소' : '새 채팅방'}
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="admin-chat-container">
        {showCreateForm && (
          <RoomCreateForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {error && (
          <div className="admin-chat-error">
            <p className="admin-chat-error-title">오류 발생</p>
            <p className="admin-chat-error-message">{error}</p>
            <button onClick={fetchRooms} className="admin-chat-retry">
              다시 시도
            </button>
          </div>
        )}

        <div>
          <div className="admin-chat-list-header">
            <h2 className="admin-chat-list-title">채팅방 목록 ({rooms.length}개)</h2>
            <button
              onClick={fetchRooms}
              disabled={loading}
              className="admin-chat-refresh"
            >
              새로고침
            </button>
          </div>

          {rooms.length === 0 ? (
            <div className="admin-chat-empty">
              <h3 className="admin-chat-empty-title">채팅방이 없습니다</h3>
              <p className="admin-chat-empty-desc">새 채팅방을 만들어보세요</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="admin-chat-toggle-btn"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                첫 채팅방 만들기
              </button>
            </div>
          ) : (
            <div className="admin-chat-list">
              {rooms.map((room) => (
                <RoomListItem
                  key={room.id}
                  room={room}
                  onUpdate={fetchRooms}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        <div className="admin-chat-guide">
          <h3 className="admin-chat-guide-title">사용 안내</h3>
          <ul className="admin-chat-guide-list">
            <li><strong>DRAFT</strong>: 준비 중이며 사용자에게 보이지 않습니다.</li>
            <li><strong>ACTIVE</strong>: 활성화되어 사용자가 입장할 수 있습니다.</li>
            <li><strong>CANCELED</strong>: 취소된 채팅방이며, 삭제 시 되돌릴 수 없습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
