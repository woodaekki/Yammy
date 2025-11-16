import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { createUsedItem } from "../api/usedItemApi"
import { getTeamColors } from "../../sns/utils/teamColors" 
import PhotoUploader from "../components/PhotoUploader"
import "../styles/usedItemCreate.css"

function UsedItemCreate() {
  const navigate = useNavigate()

  // 게시글 데이터 상태
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [team, setTeam] = useState("")
  
  // 이미지 파일 상태 (File 객체 배열)
  const [imageFiles, setImageFiles] = useState([])
  // 미리보기 URL 상태 (로컬 URL)
  const [previewUrls, setPreviewUrls] = useState([])
  
  const [teamColors, setTeamColors] = useState(getTeamColors())
  
  // 로딩 상태 (등록 중 버튼 비활성화용)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setTeamColors(getTeamColors())
  }, [])

  // 에러 메시지 상태
  const [errors, setErrors] = useState({
    title: "",
    price: "",
    description: "",
    photo: "",
    team: ""
  })

  // 실시간 유효성 검사
  const validate = (field, value) => {
    let message = ""

    switch (field) {
      case "title":
        if (value.length < 2) message = "제목은 최소 2자 이상이어야 합니다."
        else if (value.length > 50) message = "제목은 50자 이하로 작성해주세요."
        break

      case "price":
        if (value === "") message = "가격을 입력해주세요."
        else if (value < 0) message = "가격은 0원 이상이어야 합니다."
        else if (value > 1000000000) message = "가격은 10억원 이하로 입력해주세요."
        break

      case "description":
        if (value.length < 10) message = "설명은 최소 10자 이상이어야 합니다."
        else if (value.length > 1000) message = "설명은 1,000자 이하로 작성해주세요."
        break

      case "photo":
        if (value.length > 3) message = "이미지는 최대 3장까지만 등록 가능합니다."
        break

      case "team":
        if (!value) message = "팀을 선택해주세요."
        break

      default:
        break
    }

    setErrors((prev) => ({ ...prev, [field]: message }))
  }

  // 이미지 파일 선택 시 호출되는 콜백
  function handleFilesSelected(files, previews) {
    setImageFiles(files)
    setPreviewUrls(previews)
    validate("photo", files)
  }

  // 폼 제출
  async function handleSubmit(event) {
    event.preventDefault()

    // 모든 필드 유효성 검사
    validate("title", title)
    validate("price", price)
    validate("description", description)
    validate("photo", imageFiles)
    validate("team", team)

    // 에러가 있거나 필수 필드가 비어있으면 제출 중단
    if (
      Object.values(errors).some((msg) => msg) ||
      !title ||
      !price ||
      !description ||
      !team
    ) {
      alert("입력 조건을 모두 충족해야 합니다.")
      return
    }

    // 서버로 보낼 JSON 데이터 (이미지는 별도로 전송)
    const itemData = {
      title,
      price: parseInt(price),
      description,
      team
    }

    try {
      setIsSubmitting(true)
      // FormData로 JSON 데이터와 이미지 파일을 함께 전송
      await createUsedItem(itemData, imageFiles)
      alert("게시글이 등록되었습니다.")
      navigate("/useditem")
    } catch (err) {
      console.error(err)
      alert("등록 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="create-container">
      {/* 헤더 */}
      <div className="create-header">
        <button className="create-back-btn" onClick={() => navigate("/useditem")}>
          ←
        </button>
        <h1 className="create-header-title">게시글 등록</h1>
      </div>

      <form onSubmit={handleSubmit} className="create-form">
        {/* 제목 */}
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            validate("title", e.target.value)
          }}
          placeholder="제목을 입력하세요"
          className="create-input-field"
        />
        {errors.title && <p className="create-text">{errors.title}</p>}

        {/* 가격 */}
        <input
          type="number"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value)
            validate("price", e.target.value)
          }}
          placeholder="가격을 입력하세요"
          className="create-input-field"
        />
        {errors.price && <p className="create-text">{errors.price}</p>}

        {/* 설명 */}
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value)
            validate("description", e.target.value)
          }}
          placeholder="상품 설명을 입력하세요"
          className="create-textarea-field"
        />
        {errors.description && <p className="create-text">{errors.description}</p>}

        {/* 팀 선택 */}
        <select
          value={team}
          onChange={(e) => {
            setTeam(e.target.value)
            validate("team", e.target.value)
          }}
          className="create-select"
        >
          <option value="">팀 선택</option>
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
        {errors.team && <p className="create-text">{errors.team}</p>}

        {/* 이미지 선택 (업로드는 등록 시점에 수행) */}
        <div className="create-images">
          <h4>이미지 등록</h4>
          <PhotoUploader onFilesSelected={handleFilesSelected} />
        </div>
        {errors.photo && <p className="create-text">{errors.photo}</p>}

        {/* 등록 버튼 */}
        <div className="create-button-group">
          <button
            type="submit"
            className="create-submit-btn"
            disabled={Object.values(errors).some((msg) => msg) || isSubmitting}
            style={{
              backgroundColor: teamColors.bgColor,
              color: teamColors.textColor
            }}
          >
            {isSubmitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UsedItemCreate
