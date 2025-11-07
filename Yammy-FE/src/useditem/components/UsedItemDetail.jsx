import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getUsedItemById, deleteUsedItem } from "../api/usedItemApi"
import { getTeamColors } from "../../sns/utils/teamColors" 
import "../styles/usedItemDetail.css"

function UsedItemDetail() {
  const params = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const myId = localStorage.getItem("memberId")
  const [teamColors, setTeamColors] = useState(getTeamColors())

  useEffect(() => {
    setTeamColors(getTeamColors())
  }, [])

  useEffect(() => {
    getUsedItemById(params.id)
      .then((data) => setItem(data))
      .catch((error) => console.error("게시글 불러오기 실패:", error))
      .finally(() => setLoading(false))
  }, [params.id])

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

  const handleEdit = () => navigate("/useditem/edit/" + params.id)
  const handleChat = () => navigate(`/useditem/${params.id}/chat`)

  const handleDelete = () => {
    const confirmed = window.confirm("정말 이 게시글을 삭제하시겠습니까?")
    if (!confirmed) return
    deleteUsedItem(params.id)
      .then(() => {
        alert("게시글이 삭제되었습니다.")
        navigate("/useditem")
      })
      .catch((error) => {
        console.error("삭제 실패:", error)
        alert("삭제 중 오류가 발생했습니다.")
      })
  }

  if (loading) return <p className="loading-text">로딩 중...</p>
  if (!item) return <p className="loading-text">게시글을 찾을 수 없습니다.</p>

  const teamNames = {
    DOOSAN: "두산 베어스",
    LOTTE: "롯데 자이언츠",
    LG: "LG 트윈스",
    SSG: "SSG 랜더스",
    KIA: "KIA 타이거즈",
    HANWHA: "한화 이글스",
    SAMSUNG: "삼성 라이온즈",
    NC: "NC 다이노스",
    KT: "KT 위즈",
    KIWOOM: "키움 히어로즈",
  }

  return (
    <div className="detail-container">
      <div className="detail-header">
        <button onClick={() => navigate("/useditem")} className="detail-back-btn">
          ←
        </button>
        <h1 className="detail-title">상품 상세</h1>
      </div>

      {/* 이미지 슬라이더 */}
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
            {/* 썸네일 이미지 */}
            <div className="detail-thumbnail-container">
              {item.imageUrls?.map((url, index) => (
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
          <div className="no-image">이미지 없음</div>
        )}
      </div>

      {/* 본문 */}
      <div className="detail-body">
        <h2 className="detail-item-title">{item.title}</h2>

        {/* 판매자 프로필 + 버튼 */}
        <div className="detail-seller">
          <div className="detail-seller-left">
            <div className="detail-seller-avatar">
              {item.profileUrl ? (
                <img src={item.profileUrl} alt="프로필 이미지" />
              ) : null}
            </div>

            <div className="detail-seller-info">
              <p className="detail-nickname">{item.nickname || "익명"}</p>
              <p className="detail-date">
                {item.createdAt ? formatTimeAgo(item.createdAt) : "방금 전"}
              </p>
            </div>
          </div>

         <div className="detail-seller-actions">
            {/* 판매자에게만 수정/삭제 표시 */}
            {item.memberId == myId && (
              <>
                <button className="detail-text-btn" onClick={handleEdit}>수정</button>
                <button className="detail-text-btn" onClick={handleDelete}>삭제</button>
              </>
            )}

            {/* 모든 사용자에게 채팅하기 표시 */}
            <button className="detail-chat-btn" onClick={handleChat}>채팅</button>
          </div>
        </div>

        {/* 가격과 팀명 구분 */}
        <div className="detail-price-team">
          {/* 가격 */}
          <p className="detail-price">{item.price?.toLocaleString()} 원</p>

          {/* 팀명 */}
          {item.team && (
            <p
              className="detail-team-tag"
              style={{
                backgroundColor: teamColors.bgColor,
                color: teamColors.textColor,
              }}
            >
              {teamNames[item.team] || item.team}
            </p>
          )}
        </div>

        {/* 내용 */}
        <p className="detail-description">{item.description}</p>
      </div>
    </div>
  )
}

export default UsedItemDetail
