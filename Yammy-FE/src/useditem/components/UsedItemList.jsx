import { useNavigate } from "react-router-dom"
import "../styles/usedItem.css"

function UsedItemList({ items }) {
  const navigate = useNavigate()

  function goDetail(id) {
    navigate("/useditem/" + id)
  }

   function goMyPoint() {
    navigate("/mypoint") 
  }

  return (
    <div className="item-list-container">

      {items.map(function (item) {
        return (
          <div key={item.id} className="item-card" onClick={() => goDetail(item.id)}>
            <div className="item-image-container">
              {item.imageUrls && item.imageUrls.length > 0 ? (
                <img src={item.imageUrls[0]} alt={item.title} className="item-image" />
              ) : (
                <div className="no-image-box">이미지 없음</div>
              )}
            </div>

            <div className="item-info">
              <h3 className="item-title">{item.title}</h3>
              <p className="item-price">{item.price.toLocaleString()}원</p>
            </div>
          </div>
        )
      })}

       <div className="mypoint-button-container">
        <button className="mypoint-button" onClick={goMyPoint}>
          내 포인트
        </button>
      </div>
    </div>
  )
}

export default UsedItemList
