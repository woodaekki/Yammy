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
    window.dispatchEvent(new Event("chatListViewed"));
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

  const handleChatRoomClick = (roomKey) => {
    navigate(`/useditem/chat/${roomKey}`, { state: { fromChatList: true } });
  };

  // 시간 포맷 함수 (한국 시간 기준)
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const now = new Date();
    const diffInMs = now - koreaTime;
   
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInHours < 24) return `${diffInHours}시간 전`
    if (diffInDays < 7) return `${diffInDays}일 전`
    return koreaTime.toLocaleDateString('ko-KR')
  }

  if (loading) return <div className="chat-list-loading">로딩 중...</div>;

  return (
    <div className="chat-list-container">
      {/* === 헤더 === */}
      <div className="chat-list-header">
        <button
          onClick={() => navigate("/useditem")}
          className="chat-list-back-btn"
        >
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
              const isSeller = room.sellerId == myId;

              const nickname = isSeller
                ? room.buyerNickname
                : room.sellerNickname;

              const profile = isSeller
                ? room.buyerProfileImage
                : room.sellerProfileImage;

              return (
                <div
                  key={room.id}
                  className="chat-list-item"
                  onClick={() => handleChatRoomClick(room.roomKey)}
                >
                  <div className="chat-list-item-left">

                    {/* 아바타 */}
                    <div className="chat-list-item-avatar">
                      {profile ? (
                        <img src={profile} alt={nickname} />
                      ) : (
                        <div className="chat-list-item-avatar-placeholder">
                          {nickname?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>

                    {/* 텍스트 섹션 */}
                    <div className="chat-list-item-info">

                      {/* 닉네임 + 상태배지 (연두색 그대로) */}
                      <div className="nickname-status-row">
                        <span className="chat-list-nickname">{nickname}</span>
                        <span className="chat-list-item-badge">
                          {room.status === "ACTIVE" ? "활성" : "비활성"}
                        </span>
                      </div>

                      {/* 마지막 메시지 + unread */}
                      <div className="chat-list-preview-row">
                        <p className="chat-list-item-preview">
                          {room.lastMessageContent ||
                            `${nickname}와의 대화`}
                        </p>

                        {room.unreadCount > 0 && (
                          <span className="unread-badge">
                            {room.unreadCount > 9
                              ? "9+"
                              : room.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 오른쪽 시간 */}
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
