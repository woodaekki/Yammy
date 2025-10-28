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
  useEffect(function () {
    getUsedItemById(params.id)
      .then(function (data) {
        setItem(data)
      })
      .catch(function (error) {
        console.error("게시글 불러오기 실패:", error)
      })
      .finally(function () {
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
    if (!confirmed) {
      return
    }

    deleteUsedItem(params.id)
      .then(function () {
        alert("게시글이 삭제되었습니다.")
        navigate("/useditem")
      })
      .catch(function (error) {
        console.error("삭제 실패:", error)
        alert("삭제 중 오류가 발생했습니다.")
      })
  }

  // 로딩 중이거나 게시글이 없을 때
  if (loading) {
    return <p className="loading-text">로딩 중...</p>
  }

  if (!item) {
    return <p className="loading-text">게시글을 찾을 수 없습니다.</p>
  }

  return (
    <div className="detail-container">
      <div className="detail-header">
        <button
          onClick={function () {
            navigate("/useditem")
          }}
          className="back-btn"
        >
          ←
        </button>
        <h1 className="header-title">상품 상세</h1>
        <div className="header-space"></div>
      </div>

      {/* 이미지 */}
      <div className="image-slider">
        {item.imageUrls && item.imageUrls.length > 0 ? (
          item.imageUrls.map(function (url, index) {
            return (
              <img
                key={index}
                src={url}
                alt={item.title + "-" + index}
                className="detail-image"
              />
            )
          })
        ) : (
          <div className="no-image">이미지 없음</div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="detail-info">
        <h2 className="detail-title">{item.title}</h2>
        <p className="detail-price">{item.price.toLocaleString()}원</p>
        <p className="detail-description">{item.description}</p>
      </div>

      <div className="button-group">
        <button className="edit-btn" onClick={handleEdit}>
          수정
        </button>
        <button className="delete-btn" onClick={handleDelete}>
          삭제
        </button>
      </div>
    </div>
  )
}

export default UsedItemDetail
