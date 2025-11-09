import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usedItemChatApi } from '../api/usedItemChatApi';
import { getUsedItemById } from '../../useditem/api/usedItemApi';
import { useUsedItemChatMessages } from '../hooks/useUsedItemChatMessages';
import { getMyPoint } from '../../payment/api/pointAPI';
import { deposit } from '../../payment/api/escrowApi';
import useAuthStore from '../../stores/authStore';
import UsedItemMessageList from './UsedItemMessageList';
import UsedItemChatInput from './UsedItemChatInput';
import TransferModal from './TransferModal';
import '../styles/UsedItemChatPage.css';

export default function UsedItemChatPage() {
  const { roomKey } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [chatRoomInfo, setChatRoomInfo] = useState(null);
  const [itemInfo, setItemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [myBalance, setMyBalance] = useState(0);

  const { messages, loading: loadingMessages, error: messageError } =
    useUsedItemChatMessages(roomKey);

  useEffect(() => {
    if (!roomKey) return;

    const initChat = async () => {
      try {
        setLoading(true);
        
        // 인증 확인
        if (!user?.memberId) {
          alert('로그인이 필요합니다.');
          navigate('/login');
          return;
        }

        const chatRoom = await usedItemChatApi.getChatRoom(roomKey);
        setChatRoomInfo(chatRoom);

        const item = await getUsedItemById(chatRoom.usedItemId);
        setItemInfo(item);

        const pointData = await getMyPoint();
        setMyBalance(pointData.balance);
      } catch (err) {
        console.error('채팅방 초기화 실패:', err);
        
        // 인증 에러 처리
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert('로그인이 필요합니다.');
          navigate('/login');
          return;
        }
        
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [roomKey, user, navigate]);

  const handleOpenTransferModal = () => {
    if (!user?.memberId) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    setIsTransferModalOpen(true);
  };

  const handleCloseTransferModal = () => setIsTransferModalOpen(false);

  // 송금 실행 
  const handleTransferSubmit = async (amount) => {
    try {
      if (!user?.memberId) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      console.log('송금 요청:', { roomKey, amount, userId: user.memberId });

      await deposit(roomKey, amount); 

      alert('송금이 완료되었습니다.');

      // 잔액 갱신
      const updated = await getMyPoint();
      setMyBalance(updated.balance);
      window.dispatchEvent(new Event('pointUpdated'));
      
    } catch (error) {
      console.error('송금 실패:', error);
      
      // 상세한 에러 처리
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
      } else if (error.response?.status === 400) {
        alert(error.response?.data?.message || '잘못된 요청입니다.');
      } else {
        alert(error.response?.data?.message || '송금에 실패했습니다.');
      }
    }
  };

  if (error || messageError) {
    return (
      <div className="chat-error-container">
        <div className="chat-error-box">
          <div className="chat-error-icon">⚠️</div>
          <h2 className="chat-error-title">채팅방 오류</h2>
          <p className="chat-error-message">{error || messageError}</p>
          <button
            onClick={() => navigate('/chatlist')}
            className="chat-error-button"
          >
            채팅방 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

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
      {/* 헤더 */}
      <div className="chat-header">
        <div className="chat-header-inner">
          <div className="chat-header-content">
            <button onClick={() => navigate('/chatlist')} className="chat-back-button">
              <svg className="chat-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {itemInfo && (
              <div className="chat-item-info">
                {itemInfo.imageUrls?.[0] && (
                  <img src={itemInfo.imageUrls[0]} alt={itemInfo.title} className="chat-item-image" />
                )}
                <div className="chat-item-text">
                  <h2 className="chat-item-title">{itemInfo.title}</h2>
                  <p className="chat-item-price">{itemInfo.price?.toLocaleString()}원</p>
                </div>
              </div>
            )}

            {chatRoomInfo && (
              <button className="chat-transfer-btn" onClick={handleOpenTransferModal}>
                송금
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="chat-message-area">
        <UsedItemMessageList messages={messages} loading={loadingMessages} onImageClick={setSelectedImage} />
      </div>

      {roomKey && <UsedItemChatInput roomKey={roomKey} />}

      {selectedImage && (
        <div className="chat-image-modal" onClick={() => setSelectedImage(null)}>
          <div className="chat-image-modal-inner">
            <button onClick={() => setSelectedImage(null)} className="chat-image-close">
              <svg className="chat-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img src={selectedImage} alt="확대 보기" className="chat-image-full" />
          </div>
        </div>
      )}

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={handleCloseTransferModal}
        onSubmit={handleTransferSubmit}
        currentBalance={myBalance}
      />
    </div>
  );
}