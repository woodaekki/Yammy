import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { getTeamColors } from "../../sns/utils/teamColors"
import "../styles/usedItemList.css"
import empty from "../../assets/images/empty.png"

function UsedItemList({ items }) {
  const navigate = useNavigate()
  const [teamColors, setTeamColors] = useState(getTeamColors())

  useEffect(() => {
    setTeamColors(getTeamColors())
  }, [])

  function goDetail(id, isCompleted) {
    if (isCompleted) return // 거래 완료된 경우 클릭 막기
    navigate("/useditem/" + id)
  }

  // 판매 중 / 거래 완료 상품 분리
  const activeItems = items.filter(
    (item) => !["CONFIRMED", "COMPLETED", "CLOSED", "RELEASED"].includes(item.status)
  )
  const completedItems = items.filter(
    (item) => ["CONFIRMED", "COMPLETED", "CLOSED", "RELEASED"].includes(item.status)
  )

  return (
    <div className="item-list-container">
      {/* === 판매 중 === */}
      {activeItems.map((item) => (
        <div
          key={item.id}
          className="item-card"
          onClick={() => goDetail(item.id)}
        >
          <div className="item-image-container">
            {item.imageUrls && item.imageUrls.length > 0 ? (
              <img src={item.imageUrls[0]} alt={item.title} className="item-image" />
            ) : (
              <div className="no-image-box">
                <img src={empty} alt="이미지 없음" />
              </div>
            )}
          </div>
          <div className="item-info">
            <h3 className="item-title">{item.title}</h3>
            <p
              className="item-price"
              style={{ color: teamColors.bgColor }}
            >
              {item.price.toLocaleString()}얌
            </p>
          </div>
        </div>
      ))}

      {/* === 거래 완료 상품 === */}
      {completedItems.length > 0 && (
        <>
          {completedItems.map((item, index) => (
            <div
              key={item.id}
              className={`item-card item-card--disabled fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => goDetail(item.id, true)}
            >
              <div className="item-image-container">
                {item.imageUrls && item.imageUrls.length > 0 ? (
                  <img src={item.imageUrls[0]} alt={item.title} className="item-image" />
                ) : (
                  <div className="no-image-box">이미지 없음</div>
                )}
              </div>
              <div className="item-info">
                <h3 className="item-title">{item.title}</h3>
                <p className="item-price">
                  {item.price.toLocaleString()}얌</p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default UsedItemList
