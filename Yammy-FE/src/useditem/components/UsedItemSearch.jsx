import { useState, useEffect } from "react"
import { getTeamColors } from "../../sns/utils/teamColors" 
import "../styles/usedItem.css"

function UsedItemSearch({ onSearch }) {
  const [keyword, setKeyword] = useState("")
  const [team, setTeam] = useState("")
  const [teamColors, setTeamColors] = useState(getTeamColors()) // 초기 색상

  // 로그인한 유저의 팀 컬러 반영
  useEffect(() => {
    setTeamColors(getTeamColors())
  }, [])

  // 검색 버튼 클릭 or Enter 입력 시 호출
  function handleSearch(e) {
    e.preventDefault()
    onSearch({ keyword, team })
  }

  return (
    <form className="useditem-search-container" onSubmit={handleSearch}>
      {/* 팀 선택 */}
      <select
        value={team}
        onChange={(e) => setTeam(e.target.value)}
        className="search-select"
      >
        <option value="">전체 팀</option>
        <option value="DOOSAN">두산 베어스</option>
        <option value="LOTTE">롯데 자이언츠</option>
        <option value="LG">LG 트윈스</option>
        <option value="SSG">SSG 랜더스</option>
        <option value="KIA">KIA 타이거즈</option>
        <option value="HANWHA">한화 이글스</option>
        <option value="SAMSUNG">삼성 라이온즈</option>
        <option value="NC">NC 다이노스</option>
        <option value="KT">KT 위즈</option>
        <option value="KIWOOM">키움 히어로즈</option>
      </select>

      {/* 키워드 입력 */}
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="상품명 또는 설명 검색"
        className="search-input"
      />

      {/* 팀 컬러 적용 버튼 */}
      <button
        type="submit"
        className="search-btn"
        style={{
          backgroundColor: teamColors.bgColor,
          color: teamColors.textColor,
        }}
      >
        검색
      </button>
    </form>
  );
}

export default UsedItemSearch;
