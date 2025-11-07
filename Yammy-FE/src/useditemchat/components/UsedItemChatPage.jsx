import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usedItemChatApi } from '../api/usedItemChatApi';
import { getUsedItemById } from '../../useditem/api/usedItemApi';
import { useUsedItemChatMessages } from '../hooks/useUsedItemChatMessages';
import UsedItemMessageList from './UsedItemMessageList';
import UsedItemChatInput from './UsedItemChatInput';

/**
 * 중고거래 1:1 채팅 페이지
 */
export default function UsedItemChatPage() {
  const { id } = useParams(); // usedItemId
  const navigate = useNavigate();

  const [roomKey, setRoomKey] = useState(null);
  const [itemInfo, setItemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // 실시간 메시지 구독
  const { messages, loading: loadingMessages, error: messageError } = useUsedItemChatMessages(roomKey);

  // 채팅방 생성/입장 및 물품 정보 로드
  useEffect(() => {
    if (!id) return;

    const initChat = async () => {
      try {
        setLoading(true);

        // 1. 채팅방 생성/입장
        const chatRoom = await usedItemChatApi.createOrEnterChatRoom(id);
        console.log('✅ Chat room:', chatRoom);
        setRoomKey(chatRoom.roomKey);

        // 2. 물품 정보 조회
        const item = await getUsedItemById(id);
        console.log('✅ Item info:', item);
        setItemInfo(item);

        setLoading(false);
      } catch (err) {
        console.error('❌ Error initializing chat:', err);
        setError(err.response?.data?.message || err.message || '채팅방을 불러올 수 없습니다.');
        setLoading(false);
      }
    };

    initChat();
  }, [id]);

  // 에러 처리
  if (error || messageError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">채팅방 오류</h2>
          <p className="text-gray-600 mb-4">{error || messageError}</p>
          <button
            onClick={() => navigate(`/useditem/${id}`)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            물품 상세로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">채팅방 입장 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-32">
      {/* 헤더: 물품 정보 */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center gap-3">
            {/* 뒤로가기 버튼 */}
            <button
              onClick={() => navigate(`/useditem/${id}`)}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* 물품 정보 */}
            {itemInfo && (
              <div className="flex items-center gap-3 flex-1">
                {itemInfo.imageUrls && itemInfo.imageUrls[0] && (
                  <img
                    src={itemInfo.imageUrls[0]}
                    alt={itemInfo.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-800 truncate">{itemInfo.title}</h2>
                  <p className="text-sm text-gray-600">{itemInfo.price?.toLocaleString()}원</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="max-w-4xl mx-auto">
        <UsedItemMessageList
          messages={messages}
          loading={loadingMessages}
          onImageClick={(url) => setSelectedImage(url)}
        />
      </div>

      {/* 입력창 */}
      {roomKey && <UsedItemChatInput roomKey={roomKey} />}

      {/* 이미지 확대 모달 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-200 transition-colors z-10"
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
