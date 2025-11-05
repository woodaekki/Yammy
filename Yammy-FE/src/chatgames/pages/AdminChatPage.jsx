import { useState, useEffect } from 'react';
import { chatRoomApi } from '../api/chatApi';
import RoomCreateForm from '../components/RoomCreateForm';
import RoomListItem from '../components/RoomListItem';

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
      // 모든 채팅방 가져오기 (ADMIN은 모든 상태 볼 수 있음)
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

  // 생성 성공 핸들러
  const handleCreateSuccess = (newRoom) => {
    console.log('✅ 채팅방 생성 완료:', newRoom);
    setShowCreateForm(false);
    fetchRooms(); // 목록 새로고침
  };

  // 삭제 핸들러
  const handleDelete = (deletedId) => {
    setRooms(prev => prev.filter(room => room.id !== deletedId));
  };

  // 로딩 중
  if (loading && rooms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터 불러오는 중...</p>
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
              <h1 className="text-2xl font-bold text-gray-800">🔧 채팅방 관리</h1>
              <p className="text-sm text-gray-600 mt-1">채팅방을 생성하고 관리하세요</p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                showCreateForm
                  ? 'bg-gray-500 text-white hover:bg-gray-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {showCreateForm ? '취소' : '+ 새 채팅방'}
            </button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 생성 폼 */}
        {showCreateForm && (
          <RoomCreateForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* 에러 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">오류 발생</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchRooms}
              className="mt-2 text-sm underline hover:no-underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 채팅방 목록 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              채팅방 목록 ({rooms.length}개)
            </h2>
            <button
              onClick={fetchRooms}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold disabled:text-gray-400"
            >
              🔄 새로고침
            </button>
          </div>

          {rooms.length === 0 ? (
            // 빈 상태
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                채팅방이 없습니다
              </h3>
              <p className="text-gray-500 mb-4">
                새 채팅방을 만들어보세요
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-semibold"
              >
                + 첫 채팅방 만들기
              </button>
            </div>
          ) : (
            // 채팅방 목록
            <div className="space-y-4">
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

        {/* 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 사용 안내</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>DRAFT</strong>: 채팅방이 준비 중입니다. 사용자에게 보이지 않습니다.</li>
            <li>• <strong>ACTIVE</strong>: 채팅방이 활성화되어 사용자가 입장할 수 있습니다.</li>
            <li>• <strong>CANCELED</strong>: 취소된 채팅방입니다.</li>
            <li>• 채팅방을 삭제하면 <strong>되돌릴 수 없습니다</strong>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}