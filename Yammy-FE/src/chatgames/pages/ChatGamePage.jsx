import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useChatMessages } from '../hooks/useChatMessages';
import GameHeader from '../components/GameHeader';
import MessageList from '../components/MessageList';
import ImageUpload from '../components/ImageUpload';
import "../styles/ImageUpload.css";

/**
 * 채팅 게임 메인 페이지
 */
export default function ChatGamePage() {
  const { roomKey } = useParams();
  const [room, setRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const { messages, loading: loadingMessages, error } = useChatMessages(roomKey);

  useEffect(() => {
    if (!roomKey) return;

    setTimeout(() => {
      setRoom({
        roomKey: roomKey,
        name: "채팅 게임",
        homeTeam: "KIA",
        awayTeam: "LG",
        doubleHeader: false,
        startAt: new Date().toISOString(),
        status: "ACTIVE"
      });
      setLoadingRoom(false);
    }, 500);
  }, [roomKey]);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleUploadSuccess = (result) => {
    console.log('업로드 성공:', result);
  };

  const handleUploadError = (error) => {
    console.error('업로드 실패:', error);
    alert('이미지 업로드 실패: ' + error.message);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">채팅방 오류</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  if (!roomKey) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">채팅방을 찾을 수 없습니다</h2>
          <p className="text-gray-600">올바른 채팅방 링크로 접속해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <div className="bg-white shadow-sm sticky top-0 z-10 p-4">
        <GameHeader room={loadingRoom ? null : room} />
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <MessageList
          messages={messages}
          loading={loadingMessages}
          onImageClick={handleImageClick}
        />
      </div>

      <div className="chat-input-bar">
        <ImageUpload
          roomKey={roomKey}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      </div>

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
