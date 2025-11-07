import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { usedItemChatApi } from "../api/usedItemChatApi"
import "../styles/ChatList.css"

function UsedItemChatList() {
  const navigate = useNavigate()
  const [chatRooms, setChatRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const myId = localStorage.getItem("memberId")

  useEffect(() => {
    loadChatRooms()
  }, [])

  const loadChatRooms = async () => {
    try {
      const rooms = await usedItemChatApi.getMyChatRooms()
      setChatRooms(rooms)
    } catch (error) {
      console.error("채팅방 목록 불러오기 실패:", error)
      alert("채팅방 목록을 불러올 수 없습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleChatRoomClick = (roomKey) => {
    navigate(`/useditem/chat/${roomKey}`)
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    if (diff < 60) return `${diff}초 전`
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
    if (diff < 2592000) return `${Math.floor(diff / 86400)}일 전`
    return date.toLocaleDateString()
  }

  if (loading) {
    return <div className="chat-list-loading">로딩 중...</div>
  }

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <button onClick={() => navigate(-1)} className="chat-list-back-btn">
          ←
        </button>
        <h1 className="chat-list-title">채팅방 목록</h1>
      </div>

      <div className="chat-list-content">
        {chatRooms.length === 0 ? (
          <div className="chat-list-empty">
            <p>채팅방이 없습니다.</p>
            <button onClick={() => navigate("/useditem")} className="chat-list-go-market">
              중고거래 보러가기
            </button>
          </div>
        ) : (
          <div className="chat-list-items">
            {chatRooms.map((room) => {
              const isMyRoomAsSeller = room.sellerId == myId
              const otherPersonId = isMyRoomAsSeller ? room.buyerId : room.sellerId

              return (
                <div
                  key={room.id}
                  className="chat-list-item"
                  onClick={() => handleChatRoomClick(room.roomKey)}
                >
                  <div className="chat-list-item-left">
                    <div className="chat-list-item-avatar">
                      {/* TODO: 상대방 프로필 이미지 */}
                      <div className="chat-list-item-avatar-placeholder">
                        {isMyRoomAsSeller ? "구매자" : "판매자"}
                      </div>
                    </div>
                    <div className="chat-list-item-info">
                      <div className="chat-list-item-title">
                        <span className="chat-list-item-name">
                          {isMyRoomAsSeller ? `구매자 (ID: ${otherPersonId})` : `판매자 (ID: ${otherPersonId})`}
                        </span>
                        <span className="chat-list-item-badge">
                          {room.status === "ACTIVE" ? "활성" : "비활성"}
                        </span>
                      </div>
                      <p className="chat-list-item-preview">
                        {/* TODO: 마지막 메시지 표시 */}
                        물품 ID: {room.usedItemId}
                      </p>
                    </div>
                  </div>
                  <div className="chat-list-item-right">
                    <span className="chat-list-item-time">
                      {formatTimeAgo(room.createdAt)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default UsedItemChatList