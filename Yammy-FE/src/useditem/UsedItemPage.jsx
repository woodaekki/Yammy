import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { getAllUsedItems, searchUsedItems } from "../useditem/api/usedItemApi"
import { getTeamColors } from "../sns/utils/teamColors"
import emptyImage from "../assets/images/tunggugong.png"
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
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [totalPages, setTotalPages] = useState(1)

  // 데이터 불러오기 (검색어 여부에 따라)
  const loadItems = async () => {
    if (loading || !hasMore) return
    setLoading(true)

    try {
      let data
      const size = 6

      if (searchParams.keyword || searchParams.team) {
        // 검색 중이면 검색 결과 페이징
        setIsSearchMode(true)
        data = await searchUsedItems({
          ...searchParams,
          page,
          size,
        })

        // API가 totalPages 제공 시 처리
        if (data.totalPages !== undefined) {
          setTotalPages(data.totalPages)
          if (page + 1 >= data.totalPages) {
            setHasMore(false)
          }
          data = data.content || data.items || [] // 실제 목록 필드
        } else {
          // fallback: 데이터 길이 기반
          if (!data || data.length < size) {
            setHasMore(false)
          }
        }
      } else {
        // 전체 목록
        setIsSearchMode(false)
        data = await getAllUsedItems(page, size)
        if (!data || data.length < size) {
          setHasMore(false)
        }
      }

      // page === 0일 때는 새로 세팅, 아닐 때는 누적
      if (page === 0) {
        setItems(data)
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
    // 검색 중인데 totalPages가 1이면 무한스크롤 비활성화
    if (isSearchMode && totalPages <= 1) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage((prev) => prev + 1)
      }
    })

    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, searchParams, totalPages, isSearchMode])

  // 거래 완료 시 목록 새로 고침
   useEffect(() => {
    const handlePointUpdated = () => {
      setItems([])       // 기존 데이터 초기화
      setPage(0)         // 첫 페이지부터 다시 시작
      setHasMore(true)   // 무한스크롤 다시 활성화
      loadItems()        // 최신 목록 다시 불러오기
    }

    window.addEventListener("pointUpdated", handlePointUpdated)
    return () => window.removeEventListener("pointUpdated", handlePointUpdated)
  }, [])


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
       {items.length > 0 ? (
        <UsedItemList items={items} />
          ) : (
            !loading && (
              <div className="empty-state">
                <img
                  src={emptyImage}
                  alt="상품 없음"
                  className="empty-image"
                />
                <p className="empty-text">
                  등록된 상품이 없습니다
                </p>
              </div>
            )
          )}

      {/* 로딩 / 끝 메시지 */}
      {loading && <p className="loading-text">상품 불러오는 중...</p>}
      {!loading && !hasMore && items.length > 0 && (
        <p className="end-message">모든 상품을 확인했습니다</p>
      )}
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
