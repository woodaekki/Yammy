import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getAllUsedItems, searchUsedItems } from "../useditem/api/usedItemApi"
import { getTeamColors } from "../sns/utils/teamColors" 
import UsedItemSearch from "../useditem/components/UsedItemSearch"
import UsedItemList from "../useditem/components/UsedItemList"
import "../useditem/styles/usedItem.css"

function UsedItemPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [teamColors, setTeamColors] = useState(getTeamColors())

  // 초기 전체 목록 불러오기
  useEffect(() => {
    getAllUsedItems().then(setItems)
    setTeamColors(getTeamColors())
  }, [])

  // 검색 실행
  async function handleSearch({ keyword, team }) {
    try {
      const data = await searchUsedItems({ keyword, team })
      setItems(data)
    } catch (err) {
      console.error("검색 실패:", err)
      alert("검색 중 오류가 발생했습니다.")
    }
  }

  return (
    <div className="useditem-page-container">
      <UsedItemSearch onSearch={handleSearch} />
      <UsedItemList items={items} />
      <button
        className="floating-add-btn"
        style={{
          backgroundColor: teamColors.bgColor,
          color: teamColors.textColor,
        }}
        onClick={() => navigate("/useditem/create")}
      >
        ＋
      </button>
    </div>
  )
}

export default UsedItemPage
