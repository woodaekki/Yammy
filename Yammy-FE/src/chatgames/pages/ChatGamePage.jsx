import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useChatMessages } from '../hooks/useChatMessages';
import GameHeader from '../components/GameHeader';
import MessageList from '../components/MessageList';
import ImageUpload from '../components/ImageUpload';

/**
 * 채팅 게임 메인 페이지
 */
export default function ChatGamePage() {
  const { roomKey } = useParams(); // URL에서 roomKey 추출
  const [room, setRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // 실시간 메시지 구독
  const { messages, loading: loadingMessages, error } = useChatMessages(roomKey);

  // 채팅방 정보 가져오기 (임시 - 나중에 백엔드 API 연결)
  useEffect(() => {
    if (!roomKey) return;

    // TODO: 백엔드에서 room 정보 가져오기
    // const fetchRoom = async () => {
    //   const data = await chatRoomApi.getRoom(roomKey);
    //   setRoom(data);
    // };
    
    // 임시: 더미 데이터
    setTimeout(() => {
      setRoom({
        roomKey: roomKey,
        name: "채팅 게임",
        homeTeam: "홈팀",
        awayTeam: "원정팀",
        doubleHeader: false,
        startAt: new Date().toISOString(),
        status: "ACTIVE"
      });
      setLoadingRoom(false);
    }, 500);
  }, [roomKey]);

  // 이미지 클릭 핸들러 (확대 보기)
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // 모달 닫기
  const closeModal = () => {
    setSelectedImage(null);
  };

  // 업로드 성공 핸들러
  const handleUploadSuccess = (result) => {
    console.log('✅ 업로드 성공:', result);
    // 메시지는 실시간으로 자동 추가됨 (Firestore 구독)
  };

  // 업로드 실패 핸들러
  const handleUploadError = (error) => {
    console.error('❌ 업로드 실패:', error);
    alert('이미지 업로드 실패: ' + error.message);
  };

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">채팅방 오류</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  // roomKey 없음
  if (!roomKey) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-yellow-500 text-5xl mb-4">🤔</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">채팅방을 찾을 수 없습니다</h2>
          <p className="text-gray-600">올바른 채팅방 링크로 접속해주세요.</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-100 pb-32">  {/* ← pb-20을 pb-32로 */}
    {/* 헤더 */}
    <div className="bg-white shadow-sm sticky top-0 z-10 p-4">
      <GameHeader room={loadingRoom ? null : room} />
    </div>

    {/* 메시지 영역 */}
    <div className="max-w-4xl mx-auto p-4">
      <MessageList
        messages={messages}
        loading={loadingMessages}
        onImageClick={handleImageClick}
      />
    </div>

    {/* 업로드 영역 (하단 고정) */}
    <div 
      className="fixed left-0 right-0 bg-white border-t shadow-lg p-4"
      style={{ bottom: '64px', zIndex: 1001 }}
    >
      <div className="max-w-4xl mx-auto">
        <ImageUpload
          roomKey={roomKey}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      </div>
    </div>

    {/* 이미지 확대 모달 */}
  {selectedImage && (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4"
      style={{ zIndex: 2000 }}
      onClick={closeModal}
    >
      <div className="relative max-w-4xl max-h-full">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-200 transition-colors"
          style={{ zIndex: 2001 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          src={selectedImage}
          alt="확대 보기"
          className="max-w-full max-h-[90vh] rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )}
  </div>
);
}