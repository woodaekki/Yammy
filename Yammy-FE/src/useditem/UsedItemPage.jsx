import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { getAllUsedItems, searchUsedItems } from "../useditem/api/usedItemApi"
import { getTeamColors } from "../sns/utils/teamColors"
import UsedItemSearch from "../useditem/components/UsedItemSearch"
import UsedItemList from "../useditem/components/UsedItemList"
import "../useditem/styles/usedItem.css"

function UsedItemPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useState({ keyword: "", team: "" })
  const [teamColors, setTeamColors] = useState(getTeamColors())
  const loaderRef = useRef(null)

  // 데이터 불러오기 (검색어 여부에 따라)
  const loadItems = async () => {
    if (loading || !hasMore) return
    setLoading(true)

    try {
      let data
      if (searchParams.keyword || searchParams.team) {
        // 검색 중이면 검색 결과 페이징
        data = await searchUsedItems({
          ...searchParams,
          page,
          size: 6,
        })
      } else {
        // 전체 목록
        data = await getAllUsedItems(page, 6)
      }

      if (data.length === 0) {
        setHasMore(false)
      } else {
        setItems((prev) => [...prev, ...data])
      }
    } catch (err) {
      console.error("목록 불러오기 실패:", err)
    } finally {
      setLoading(false)
    }
  }

  // page가 바뀔 때마다 새로 불러오기
  useEffect(() => {
    loadItems()
  }, [page, searchParams])

  // IntersectionObserver (무한 스크롤)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage((prev) => prev + 1)
      }
    })
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading])

  // 검색 실행 (새 검색 시 기존 데이터 리셋)
  async function handleSearch({ keyword, team }) {
    setSearchParams({ keyword, team })
    setItems([]) // 기존 목록 초기화
    setPage(0)   // 첫 페이지부터 다시 시작
    setHasMore(true)
  }

  useEffect(() => {
    setTeamColors(getTeamColors())
  }, [])

  return (
    <div className="useditem-page-container">
      {/* 검색 영역 */}
      <UsedItemSearch onSearch={handleSearch} />

      {/* 리스트 */}
      <UsedItemList items={items} />

      {/* 로딩 / 끝 메시지 */}
      {loading && <p className="loading-text">상품 불러오는 중...</p>}
      {!hasMore && <p className="end-message">모든 상품을 확인했습니다</p>}

      {/* 감시용 div */}
      <div ref={loaderRef} style={{ height: "40px" }} />

      {/* 작성 버튼 */}
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
