import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getUsedItemById, deleteUsedItem } from "../api/usedItemApi"
import "../styles/usedItem.css"

function UsedItemDetail() {
  const params = useParams()
  const navigate = useNavigate()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  // 게시글 불러오기
  useEffect(() => {
    getUsedItemById(params.id)
      .then((data) => {
        setItem(data)
      })
      .catch((error) => {
        console.error("게시글 불러오기 실패:", error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [params.id])

  // 수정 클릭 시
  function handleEdit() {
    navigate("/useditem/edit/" + params.id)
  }

  // 삭제 클릭 시
  function handleDelete() {
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

  // 채팅 클릭 시
  function handleChat() {
    navigate(`/useditem/${params.id}/chat`)
  }

  // 결제 클릭 시
  function handleCharge() {
    navigate(`/useditem/${params.id}/check`)
  }

  // 로딩 중이거나 게시글이 없을 때
  if (loading) return <p className="loading-text">로딩 중...</p>
  if (!item) return <p className="loading-text">게시글을 찾을 수 없습니다.</p>

  // 한글 팀명 변환 (Enum → 한글)
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
    KIWOOM: "키움 히어로즈"
  }

  return (
    <div className="detail-container">
      <div className="detail-header">
        <button
          onClick={() => navigate("/useditem")}
          className="back-btn"
        >
          ←
        </button>
        <h1 className="header-title">상품 상세</h1>
        <div className="header-space" />
      </div>

      {/* 이미지 */}
      <div className="image-slider">
        {item.imageUrls && item.imageUrls.length > 0 ? (
          item.imageUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`${item.title}-${index}`}
              className="detail-image"
            />
          ))
        ) : (
          <div className="no-image">이미지 없음</div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="detail-info">
        <h2 className="detail-title">{item.title}</h2>
        <p className="detail-price">{item.price.toLocaleString()}원</p>

        {item.team && (
          <p className="detail-team">
            {teamNames[item.team] || item.team}
          </p>
        )}

        <p className="detail-description">{item.description}</p>
      </div>

      <div className="button-group">
        <button className="edit-btn" onClick={handleEdit}>
          수정
        </button>
        <button className="delete-btn" onClick={handleDelete}>
          삭제
        </button>
        <button className="chat-btn" onClick={handleChat}>
          채팅
        </button>
        <button className="charge-btn" onClick={handleCharge}>
          결제
        </button>
      </div>
    </div>
  )
}

export default UsedItemDetail
