/**
 * 게임 정보 헤더 컴포넌트
 * @param {Object} room - 채팅방 정보
 */
export default function GameHeader({ room }) {
  if (!room) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-blue-400 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-blue-400 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  // 상태별 표시
  const statusConfig = {
    DRAFT: { text: '준비 중', color: 'bg-gray-500', icon: '⏳' },
    ACTIVE: { text: '진행 중', color: 'bg-green-500', icon: '●' },
    CANCELED: { text: '취소됨', color: 'bg-red-500', icon: '✕' }
  };

  const status = statusConfig[room.status] || statusConfig.DRAFT;

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleString('ko-KR', options);
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
      {/* 팀 정보 */}
      <div className="flex items-center justify-center gap-4 mb-3">
        <div className="text-right">
          <span className="text-2xl font-bold">{room.homeTeam || '홈팀'}</span>
          <span className="text-xs block text-blue-100">HOME</span>
        </div>
        
        <div className="text-3xl font-bold px-3">VS</div>
        
        <div className="text-left">
          <span className="text-2xl font-bold">{room.awayTeam || '원정팀'}</span>
          <span className="text-xs block text-blue-100">AWAY</span>
        </div>
      </div>

      {/* 경기 정보 */}
      <div className="text-center space-y-1">
        <h1 className="text-lg font-semibold">{room.name}</h1>
        
        {room.startAt && (
          <p className="text-sm text-blue-100">
            📅 {formatDate(room.startAt)}
          </p>
        )}
        
        {room.doubleHeader && (
          <span className="inline-block bg-blue-400 text-white text-xs px-3 py-1 rounded-full">
            🔄 더블헤더
          </span>
        )}
      </div>

      {/* 상태 표시 */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className={`inline-flex items-center gap-1 ${status.color} text-white text-xs px-3 py-1 rounded-full`}>
          <span>{status.icon}</span>
          <span>{status.text}</span>
        </span>
      </div>
    </div>
  );
}