import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { usedItemChatApi } from "../api/usedItemChatApi";
import { getUsedItemById } from "../../useditem/api/usedItemApi";
import { useUsedItemChatMessages } from "../hooks/useUsedItemChatMessages";
import { getMyPoint } from "../../payment/api/pointAPI";
import { deposit } from "../../payment/api/escrowApi";
import useAuthStore from "../../stores/authStore";
import UsedItemMessageList from "./UsedItemMessageList";
import UsedItemChatInput from "./UsedItemChatInput";
import TransferModal from "./TransferModal";
import "../styles/UsedItemChatPage.css";

export default function UsedItemChatPage() {
  const { roomKey } = useParams();
  const navigate = useNavigate();
  const { user, initialize } = useAuthStore();

  const [chatRoomInfo, setChatRoomInfo] = useState(null);
  const [itemInfo, setItemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [myBalance, setMyBalance] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);

  const { messages, loading: loadingMessages, error: messageError } =
    useUsedItemChatMessages(roomKey);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!roomKey) return;

    const initChat = async () => {
      try {
        setLoading(true);

        let memberId = user?.memberId || localStorage.getItem("memberId");
        const maxAttempts = 3;
        let attempt = 0;

        while (!memberId && attempt < maxAttempts) {
          await new Promise((res) => setTimeout(res, 200));
          memberId = user?.memberId || localStorage.getItem("memberId");
          attempt += 1;
        }

        if (!memberId) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }

        const chatRoom = await usedItemChatApi.getChatRoom(roomKey);
        setChatRoomInfo(chatRoom);

        /** from=chat 로 조회해야 detail 차단을 안당함 */
        const item = await getUsedItemById(chatRoom.usedItemId, "chat");
        setItemInfo(item);

        await usedItemChatApi.markAsRead(roomKey);

        const pointData = await getMyPoint();
        setMyBalance(pointData.balance);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [roomKey, navigate, user]);

  useEffect(() => {
    return () => {
      usedItemChatApi.markAsRead(roomKey);
      window.dispatchEvent(new Event('chatListViewed'));
    };
  }, [roomKey]);

  // 10초마다 물품 상태 확인 (CONFIRMED 감지)
  useEffect(() => {
    if (!chatRoomInfo?.usedItemId || itemInfo?.status === 'CONFIRMED') return;

    const interval = setInterval(async () => {
      try {
        const updatedItem = await getUsedItemById(chatRoomInfo.usedItemId, "chat");

        if (updatedItem.status !== itemInfo?.status) {
          setItemInfo(updatedItem);
        }
      } catch (error) {
        console.error('물품 상태 확인 실패:', error);
      }
    }, 10000); // 10초마다

    return () => clearInterval(interval);
  }, [chatRoomInfo?.usedItemId, itemInfo?.status]);

  const handleOpenTransferModal = () => {
    const memberId = user?.memberId || localStorage.getItem("memberId");
    if (!memberId) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    setIsTransferModalOpen(true);
  };

  const handleCloseTransferModal = () => setIsTransferModalOpen(false);

  const handleTransferSubmit = async (amount) => {
    try {
      const memberId = user?.memberId || localStorage.getItem("memberId");
      if (!memberId) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      await deposit(roomKey, amount);
      alert("송금이 완료되었습니다.");

      const updated = await getMyPoint();
      setMyBalance(updated.balance);
      window.dispatchEvent(new Event("pointUpdated"));

      // 물품 정보 즉시 갱신
      const updatedItem = await getUsedItemById(chatRoomInfo.usedItemId, "chat");
      setItemInfo(updatedItem);

      // 모달 닫기
      handleCloseTransferModal();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("인증이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/login");
      } else if (error.response?.status === 400) {
        alert(error.response?.data?.message || "잘못된 요청입니다.");
      } else {
        alert(error.response?.data?.message || "송금에 실패했습니다.");
      }
    }
  };

  const handleLeaveChatRoom = async () => {
    const confirmed = window.confirm("채팅방을 나가시겠습니까?\n상대방도 나가면 채팅방이 삭제됩니다.");
    if (!confirmed) return;

    try {
      setIsLeaving(true);
      await usedItemChatApi.leaveChatRoom(roomKey);
      alert("채팅방을 나갔습니다.");
      navigate("/chatlist");
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("인증이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/login");
      } else {
        alert(error.response?.data?.message || "채팅방 나가기에 실패했습니다.");
      }
    } finally {
      setIsLeaving(false);
    }
  };

  if (error || messageError) {
    return (
      <div className="useditem-chat-error-page">
        <div className="useditem-chat-error-box">
          <h2>오류 발생</h2>
          <p>{error || messageError}</p>
        </div>
      </div>
    );
  }

  if (loading) return null;

  return (
    <div className="useditem-chat-page">
      {createPortal(
        <div className="useditem-chat-header-fixed">
          <div className="useditem-chat-header-inner">
            <button className="useditem-chat-back-button" onClick={() => navigate("/chatlist")}>
              ←
            </button>

            {itemInfo && (
              <div
                className="useditem-chat-item-info"
                onClick={() => navigate(`/useditem/${chatRoomInfo.usedItemId}?from=chat`)}
              >
                {itemInfo.imageUrls?.[0] && (
                  <img src={itemInfo.imageUrls[0]} className="useditem-chat-item-image" />
                )}

                <div className="useditem-chat-item-text">
                  <div className="useditem-chat-item-title">{itemInfo.title}</div>
                  <div className="useditem-chat-item-price">{itemInfo.price?.toLocaleString()}얌</div>
                </div>
              </div>
            )}

            <div className="useditem-chat-header-buttons">
              {/* 구매자만 송금 버튼 표시 */}
              {chatRoomInfo?.buyerId == (user?.memberId || localStorage.getItem("memberId")) && (
                <button 
                  className="useditem-chat-transfer-btn" 
                  onClick={handleOpenTransferModal}
                  disabled={itemInfo?.status === 'CONFIRMED'}
                >
                  송금
                </button>
              )}
              <button className="useditem-chat-leave-btn" onClick={handleLeaveChatRoom}>
                나가기
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="useditem-chat-message-area">
        <UsedItemMessageList
          messages={messages}
          loading={loadingMessages}
          onImageClick={setSelectedImage}
        />
      </div>

      {createPortal(
        <div className="useditem-chat-input-fixed">
          <UsedItemChatInput
              roomKey={roomKey}
              disabled={
                chatRoomInfo?.sellerDeleted || 
                chatRoomInfo?.buyerDeleted ||
                itemInfo?.status === 'CONFIRMED'
              }
            />
        </div>,
        document.body
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
