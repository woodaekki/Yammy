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

  // 한국어 팀명
  const getKoreanTeamName = (team) => {
    const map = {
      LG: "LG 트윈스",
      SSG: "SSG 랜더스",
      NC: "NC 다이노스",
      LOTTE: "롯데 자이언츠",
      DOOSAN: "두산 베어스",
      KT: "KT 위즈",
      KIA: "KIA 타이거즈",
      SAMSUNG: "삼성 라이온즈",
      HANWHA: "한화 이글스",
      KIWOOM: "키움 히어로즈",
    }
    return map[team] || "팀 미지정"
  }

  // “방금전/몇시간전” 포맷
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000)
    const now = new Date()
    const diff = now - koreaTime

    const mins = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (mins < 1) return "방금 전"
    if (mins < 60) return `${mins}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return koreaTime.toLocaleDateString("ko-KR")
  }

  const activeItems = items.filter(
    (item) => !["CONFIRMED", "COMPLETED", "CLOSED", "RELEASED"].includes(item.status)
  )
  const completedItems = items.filter(
    (item) => ["CONFIRMED", "COMPLETED", "CLOSED", "RELEASED"].includes(item.status)
  )

  const merged = [...activeItems, ...completedItems]

  return (
    <div className="camel-grid-container">
      {merged.map((item) => {
        const isCompleted = completedItems.includes(item)

        return (
          <div
            key={item.id}
            className="camel-card"
            onClick={() => !isCompleted && navigate("/useditem/" + item.id)}
          >
            {/* 이미지 */}
            <div className={`camel-img-box ${isCompleted ? "camel-blur" : ""}`}>
              {item.imageUrls?.length > 0 ? (
                <img src={item.imageUrls[0]} alt={item.title} />
              ) : (
                <div className="camel-noimg">
                  <img src={empty} alt="no-img" />
                </div>
              )}

              {/* 🔥 중앙 동그라미 배지 (거래완료 텍스트) */}
              {isCompleted && (
                <div className="camel-circle-done">
                  거래완료
                </div>
              )}
            </div>

            {/* 텍스트 */}
            <div className="camel-info-box">
              <div className="camel-title">{item.title}</div>

              <div className="camel-price" style={{ color: teamColors.bgColor }}>
                {item.price.toLocaleString()}얌
              </div>

              <div className="camel-sub">
                <span className="camel-team">{getKoreanTeamName(item.team)}</span>
                <span className="camel-dot">·</span>
                <span className="camel-time">{formatTimeAgo(item.createdAt)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default UsedItemList
