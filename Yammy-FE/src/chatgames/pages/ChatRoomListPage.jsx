import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chatRoomApi } from '../api/chatApi';
import useAuthStore from "../../stores/authStore";
import "../styles/ChatRoomListPage.css";

/**
 * 채팅방 목록 페이지
 */
export default function ChatRoomListPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.authority === 'ADMIN';

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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleString('ko-KR', options);
  };

  if (loading) {
    return (
      <div className="chat-room-page flex-center">
        <div className="chat-room-loading">
          <div className="chat-room-spinner"></div>
          <p>채팅방 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-room-page flex-center">
        <div className="chat-room-error">
          <h2>오류 발생</h2>
          <p>{error}</p>
          <button onClick={fetchRooms} className="chat-room-error-retry">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-room-page">
      {/* 헤더 */}
      <div className="chat-room-header">
        <div className="chat-room-header-inner">
          <div>
            <h1 className="chat-room-title">진행 중인 경기</h1>
            <p className="chat-room-subtitle">응원하고 싶은 경기를 선택하세요</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => navigate('/admin/chat')}
              className="chat-room-admin-btn"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>채팅방 관리</span>
            </button>
          )}
        </div>
      </div>

      {/* 채팅방 목록 */}
      <div className="chat-room-list">
        {rooms.length === 0 ? (
          <div className="chat-room-empty">
            <h3 className="chat-room-empty-title">진행 중인 경기가 없습니다</h3>
            <p className="chat-room-empty-desc">경기가 시작되면 여기에 표시됩니다</p>
          </div>
        ) : (
          <div className="chat-room-list-inner">
            {rooms.map((room) => (
              <Link
                key={room.id}
                to={`/cheerup/${room.roomKey}`}
                className="chat-room-card"
              >
                <div className="chat-room-teams">
                  <div className="text-right">
                    <div className="chat-room-team">{room.homeTeam || '홈팀'}</div>
                    <div className="chat-room-team-sub">HOME</div>
                  </div>

                  <div className="chat-room-vs">VS</div>

                  <div className="text-left">
                    <div className="chat-room-team">{room.awayTeam || '원정팀'}</div>
                    <div className="chat-room-team-sub">AWAY</div>
                  </div>
                </div>

                <div className="chat-room-info">
                  {/* <h3 className="chat-room-name">{room.name}</h3> */}
                  {room.startAt && (
                    <p className="chat-room-date">{formatDate(room.startAt)}</p>
                  )}
                  <div className="chat-room-tags">
                    {room.doubleHeader && (
                      <span className="chat-room-tag double">더블헤더</span>
                    )}
                    <span className="chat-room-tag live">진행 중</span>
                  </div>
                </div>

                <div className="chat-room-enter">
                  <span className="chat-room-enter-btn">
                    입장하기
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 새로고침 버튼 */}
      <div className="chat-room-refresh">
        <button onClick={fetchRooms} className="chat-room-refresh-btn" aria-label="새로고침">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
