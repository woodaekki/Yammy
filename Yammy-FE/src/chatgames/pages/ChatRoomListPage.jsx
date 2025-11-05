import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chatRoomApi } from '../api/chatApi';
import useAuthStore from "../../stores/authStore";
/**
 * 채팅방 목록 페이지
 */
export default function ChatRoomListPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();  // ← 추가!
  const user = useAuthStore((state) => state.user);  // ← 추가!
  const isAdmin = user?.authority === 'ADMIN';  // ← 추가!


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

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleString('ko-KR', options);
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">채팅방 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">오류 발생</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchRooms}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* 헤더 */}
      <div className="bg-white shadow-sm sticky top-0 z-10 p-4">
  <div className="max-w-4xl mx-auto">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">⚾ 진행 중인 경기</h1>
        <p className="text-sm text-gray-600 mt-1">응원하고 싶은 경기를 선택하세요</p>
      </div>
      
      {/* ADMIN만 보이는 버튼 */}
      {isAdmin && (
        <button
          onClick={() => navigate('/admin/chat')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-semibold transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>채팅방 관리</span>
        </button>
      )}
    </div>
  </div>
</div>

      {/* 채팅방 목록 */}
      <div className="max-w-4xl mx-auto p-4">
        {rooms.length === 0 ? (
          // 빈 상태
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🏟️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              진행 중인 경기가 없습니다
            </h3>
            <p className="text-gray-500">경기가 시작되면 여기에 표시됩니다</p>
          </div>
        ) : (
          // 채팅방 목록
          <div className="space-y-4">
            {rooms.map((room) => (
              <Link
                key={room.id}
                to={`/cheerup/${room.roomKey}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                {/* 팀 정보 */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">
                      {room.homeTeam || '홈팀'}
                    </div>
                    <div className="text-xs text-gray-500">HOME</div>
                  </div>
                  
                  <div className="text-xl font-bold text-gray-400">VS</div>
                  
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gray-800">
                      {room.awayTeam || '원정팀'}
                    </div>
                    <div className="text-xs text-gray-500">AWAY</div>
                  </div>
                </div>

                {/* 경기 정보 */}
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-gray-700">
                    {room.name}
                  </h3>
                  
                  {room.startAt && (
                    <p className="text-sm text-gray-600">
                      📅 {formatDate(room.startAt)}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {room.doubleHeader && (
                      <span className="inline-block bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full">
                        🔄 더블헤더
                      </span>
                    )}
                    <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                      ● 진행 중
                    </span>
                  </div>
                </div>

                {/* 입장 버튼 */}
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-2 text-blue-600 font-semibold">
                    <span>입장하기</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="fixed bottom-20 right-4">
        <button
          onClick={fetchRooms}
          className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          aria-label="새로고침"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
}