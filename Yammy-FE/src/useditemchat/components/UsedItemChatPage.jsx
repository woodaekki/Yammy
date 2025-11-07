import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usedItemChatApi } from '../api/usedItemChatApi';
import { getUsedItemById } from '../../useditem/api/usedItemApi';
import { useUsedItemChatMessages } from '../hooks/useUsedItemChatMessages';
import UsedItemMessageList from './UsedItemMessageList';
import UsedItemChatInput from './UsedItemChatInput';
import '../styles/UsedItemChatPage.css';

/**
 * 중고거래 1:1 채팅 페이지
 */
export default function UsedItemChatPage() {
  const { roomKey } = useParams(); // 채팅방 키
  const navigate = useNavigate();

  const [chatRoomInfo, setChatRoomInfo] = useState(null); // 채팅방 정보
  const [itemInfo, setItemInfo] = useState(null); // 물품 정보
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 메시지
  const [selectedImage, setSelectedImage] = useState(null); // 클릭한 이미지 확대

  // 실시간 메시지 구독
  const { messages, loading: loadingMessages, error: messageError } = useUsedItemChatMessages(roomKey);

  // 채팅방 정보 및 물품 정보 로드
  useEffect(() => {
    if (!roomKey) return;

    const initChat = async () => {
      try {
        setLoading(true);

        // 1. 채팅방 정보 조회
        const chatRoom = await usedItemChatApi.getChatRoom(roomKey);
        console.log('Chat room:', chatRoom);
        setChatRoomInfo(chatRoom);

        // 2. 물품 정보 조회
        const item = await getUsedItemById(chatRoom.usedItemId);
        console.log('Item info:', item);
        setItemInfo(item);

        setLoading(false);
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError(err.response?.data?.message || err.message || '채팅방을 불러올 수 없습니다.');
        setLoading(false);
      }
    };

    initChat();
  }, [roomKey]);

  // 에러 처리
  if (error || messageError) {
    return (
      <div className="chat-error-container">
        <div className="chat-error-box">
          <div className="chat-error-icon">⚠️</div>
          <h2 className="chat-error-title">채팅방 오류</h2>
          <p className="chat-error-message">{error || messageError}</p>
          <button onClick={() => navigate('/chatlist')} className="chat-error-button">
            채팅방 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="chat-loading-container">
        <div className="chat-loading-box">
          <div className="chat-spinner"></div>
          <p className="chat-loading-text">채팅방 입장 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      {/* 헤더: 물품 정보 */}
      <div className="chat-header">
        <div className="chat-header-inner">
          <div className="chat-header-content">
            {/* 뒤로가기 버튼 */}
            <button onClick={() => navigate('/chatlist')} className="chat-back-button">
              <svg className="chat-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* 물품 정보 */}
            {itemInfo && (
              <div className="chat-item-info">
                {itemInfo.imageUrls && itemInfo.imageUrls[0] && (
                  <img src={itemInfo.imageUrls[0]} alt={itemInfo.title} className="chat-item-image" />
                )}
                <div className="chat-item-text">
                  <h2 className="chat-item-title">{itemInfo.title}</h2>
                  <p className="chat-item-price">{itemInfo.price?.toLocaleString()}원</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="chat-message-area">
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
        <div className="chat-image-modal" onClick={() => setSelectedImage(null)}>
          <div className="chat-image-modal-inner">
            <button onClick={() => setSelectedImage(null)} className="chat-image-close">
              <svg className="chat-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage}
              alt="확대 보기"
              className="chat-image-full"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
