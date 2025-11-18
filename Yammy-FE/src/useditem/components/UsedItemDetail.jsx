import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getUsedItemById, deleteUsedItem } from "../api/usedItemApi"
import { usedItemChatApi } from "../../useditemchat/api/usedItemChatApi"
import "../styles/usedItemDetail.css"
import empty from "../../assets/images/empty.png"

// 팀 코드(ENUM) → 팀 한글 이름 매핑
const TEAM_MAP = {
  DOOSAN: "두산 베어스",
  LOTTE: "롯데 자이언츠",
  LG: "LG 트윈스",
  SSG: "SSG 랜더스",
  KIA: "KIA 타이거즈",
  HANWHA: "한화 이글스",
  SAMSUNG: "삼성 라이온즈",
  NC: "NC 다이노스",
  KT: "KT 위즈",
  KIWOOM: "키움 히어로즈"
}

// 한글 팀명 → 색상 매핑
const TEAM_COLORS = {
  '키움 히어로즈': { bgColor: '#570514', textColor: '#ffffff' },
  '두산 베어스': { bgColor: '#1A1748', textColor: '#ffffff' },
  '롯데 자이언츠': { bgColor: '#041E42', textColor: '#ffffff' },
  '삼성 라이온즈': { bgColor: '#074CA1', textColor: '#ffffff' },
  '한화 이글스': { bgColor: '#FC4E00', textColor: '#ffffff' },
  'KIA 타이거즈': { bgColor: '#EA0029', textColor: '#ffffff' },
  'LG 트윈스': { bgColor: '#C30452', textColor: '#ffffff' },
  'SSG 랜더스': { bgColor: '#CF0E20', textColor: '#ffffff' },
  'NC 다이노스': { bgColor: '#315288', textColor: '#ffffff' },
  'KT 위즈': { bgColor: '#000000', textColor: '#ffffff' }
}

function UsedItemDetail() {
  const params = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const myId = localStorage.getItem("memberId")
  const [isChatLoading, setIsChatLoading] = useState(false)

  // from 파라미터
  const search = new URLSearchParams(window.location.search)
  const from = search.get("from")

  // 상품 상세 로드
  useEffect(() => {
    getUsedItemById(params.id, from)
      .then(data => setItem(data))
      .catch(error => console.error("게시글 불러오기 실패:", error))
      .finally(() => setLoading(false))
  }, [params.id, from])

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000)
    const now = new Date()
    const diffInMs = now - koreaTime

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) return "방금 전"
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInHours < 24) return `${diffInHours}시간 전`
    if (diffInDays < 7) return `${diffInDays}일 전`
    return koreaTime.toLocaleDateString("ko-KR")
  }

  const handleEdit = () => navigate(`/useditem/edit/${params.id}`)

  const handleChat = async () => {
    if (isChatLoading) return
    try {
      setIsChatLoading(true)
      const chatRoom = await usedItemChatApi.createOrEnterChatRoom(params.id)
      navigate(`/useditem/chat/${chatRoom.roomKey}`)
    } catch (error) {
      console.error("채팅방 생성 실패:", error)
      alert("채팅방 입장에 실패했습니다.")
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleDelete = () => {
    const confirmed = window.confirm("정말 이 게시글을 삭제하시겠습니까?")
    if (!confirmed) return

    deleteUsedItem(params.id)
      .then(() => {
        alert("게시글이 삭제되었습니다.")
        navigate("/useditem")
      })
      .catch(error => {
        console.error("삭제 실패:", error)
        alert("삭제 중 오류가 발생했습니다.")
      })
  }

  if (loading) return <p className="loading-text"></p>
  if (!item) return <p className="loading-text">데이터가 없습니다.</p>

  // 완료된 상태
  const completedStatuses = ["CONFIRMED", "HOLD", "CANCELLED"]
  const isCompletedStatus = completedStatuses.includes(item.status)

  // chat 경로가 아니면 차단
  if (from !== "chat" && isCompletedStatus) {
    return (
      <div className="detail-notfound">
        <p className="nf-title">이미 거래가 완료된 상품입니다</p>
        <p className="nf-sub">더 이상 이 상품의 상세 페이지를 확인할 수 없어요.</p>
        <button className="nf-btn" onClick={() => navigate("/useditem")}>
          목록으로 돌아가기
        </button>
      </div>
    )
  }

  // 팀 컬러 가져오기
  const teamKoreanName = TEAM_MAP[item.team]
  const teamColor = TEAM_COLORS[teamKoreanName] || { bgColor: "#eee", textColor: "#000" }

  return (
    <div className="detail-container">

      <div className="detail-header">
        <button onClick={() => navigate("/useditem")} className="detail-back-btn">←</button>
        <span className="detail-title">상품 상세</span>
      </div>

      <div className="detail-image-slider">
        {item.imageUrls?.length > 0 ? (
          <>
            {item.imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`${item.title}-${index}`}
                className={`detail-image ${index === currentIndex ? "active" : ""}`}
              />
            ))}

            <div className="detail-slider-dots">
              {item.imageUrls.map((_, index) => (
                <div
                  key={index}
                  className={`detail-slider-dot ${index === currentIndex ? "active" : ""}`}
                  onClick={() => setCurrentIndex(index)}
                ></div>
              ))}
            </div>

            <div className="detail-thumbnail-container">
              {item.imageUrls.map((url, index) => (
                <div
                  key={index}
                  className={`detail-thumbnail ${index === currentIndex ? "active" : ""}`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <img src={url} alt={`${item.title}-thumb-${index}`} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="no-image">
            <img src={empty} alt="이미지 없음" />
          </div>
        )}
      </div>

      <div className="detail-body">
        <h2 className="detail-item-title">{item.title}</h2>

        <div className="detail-seller">
          <div className="detail-seller-left">
            <div className="detail-seller-avatar">
              {item.profileUrl ? (
                <img src={item.profileUrl} alt="프로필 이미지" />
              ) : (
                <div className="avatar-placeholder">⚾</div>
              )}
            </div>

            <div className="detail-seller-info">
              <p className="detail-nickname">{item.nickname || "익명"}</p>
              <p className="detail-date">{item.createdAt ? formatTimeAgo(item.createdAt) : "방금 전"}</p>
            </div>
          </div>

          <div className="detail-seller-actions">
            {item.memberId == myId ? (
              <>
                <button className="detail-text-btn" onClick={handleEdit}>수정</button>
                <button className="detail-text-btn" onClick={handleDelete}>삭제</button>
              </>
            ) : (
              <button
                className="detail-chat-btn"
                onClick={handleChat}
                disabled={isChatLoading}
              >
                {isChatLoading ? "입장 중..." : "채팅"}
              </button>
            )}
          </div>
        </div>

        <div className="detail-price-team">
          <p className="detail-price">{item.price?.toLocaleString()} 얌</p>

          {item.team && (
            <p
              className="detail-team-tag"
              style={{
                backgroundColor: teamColor.bgColor,
                color: teamColor.textColor
              }}
            >
              {teamKoreanName}
            </p>
          )}
        </div>

        <p className="detail-description">{item.description}</p>
      </div>
    </div>
  )
}

export default UsedItemDetail
