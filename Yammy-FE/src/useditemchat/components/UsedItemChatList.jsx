import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usedItemChatApi } from "../api/usedItemChatApi";
import "../styles/ChatList.css";

function UsedItemChatList() {
  const navigate = useNavigate();
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const myId = localStorage.getItem("memberId");

  useEffect(() => {
    loadChatRooms();
  }, []);

  const loadChatRooms = async () => {
    try {
      const rooms = await usedItemChatApi.getMyChatRooms();
      setChatRooms(rooms);
    } catch (error) {
      console.error("채팅방 목록 불러오기 실패:", error);
      alert("채팅방 목록을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ navigate 시 새로고침 필요 없도록 replace 옵션 제거
  const handleChatRoomClick = (roomKey) => {
    // 상태 보존 + 렌더 강제 보장
    navigate(`/useditem/chat/${roomKey}`, { state: { fromChatList: true } });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `${diff}초 전`;
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}일 전`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="chat-list-loading">로딩 중...</div>;
  }

  return (
    <div className="chat-list-container">
      {/* === 헤더 === */}
      <div className="chat-list-header">
        <button onClick={() => navigate("/useditem")} className="chat-list-back-btn">
          ←
        </button>
        <h1 className="chat-list-title">채팅방 목록</h1>
      </div>

      {/* === 본문 === */}
      <div className="chat-list-content">
        {chatRooms.length === 0 ? (
          <div className="chat-list-empty">
            <p>채팅방이 없습니다.</p>
            <button
              onClick={() => navigate("/useditem")}
              className="chat-list-go-market"
            >
              중고거래 보러가기
            </button>
          </div>
        ) : (
          <div className="chat-list-items">
            {chatRooms.map((room) => {
              const isMyRoomAsSeller = room.sellerId == myId;
              const otherPersonId = isMyRoomAsSeller
                ? room.buyerId
                : room.sellerId;

              return (
                <div
                  key={room.id}
                  className="chat-list-item"
                  onClick={() => handleChatRoomClick(room.roomKey)}
                >
                  <div className="chat-list-item-left">
                    <div className="chat-list-item-avatar">
                      <div className="chat-list-item-avatar-placeholder">
                        {isMyRoomAsSeller ? room.buyerNickname : room.sellerNickname}
                      </div>
                    </div>
                    <div className="chat-list-item-info">
                      <div className="chat-list-item-title">
                        <span className="chat-list-item-name">
                          {room.itemTitle || '제목 없음'}
                        </span>
                        <span className="chat-list-item-badge">
                          {room.status === "ACTIVE" ? "활성" : "비활성"}
                        </span>
                      </div>
                      <p className="chat-list-item-preview">
                        {isMyRoomAsSeller ? room.buyerNickname : room.sellerNickname}와의 대화
                      </p>
                    </div>
                  </div>
                  <div className="chat-list-item-right">
                    <span className="chat-list-item-time">
                      {formatTimeAgo(room.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default UsedItemChatList;
