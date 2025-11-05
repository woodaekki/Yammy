import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getUsedItemById, updateUsedItem } from "../api/usedItemApi"
import PhotoUploader from "../components/PhotoUploader"
import "../styles/usedItemEdit.css"

function UsedItemEdit() {
  const params = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    team: ""
  })

  const [existingPhotos, setExistingPhotos] = useState([])
  const [newPhotoIds, setNewPhotoIds] = useState(undefined)
  const [loading, setLoading] = useState(true)

  // 게시글 불러오기
  useEffect(() => {
    getUsedItemById(params.id)
      .then((data) => {
        setForm({
          title: data.title,
          price: data.price,
          description: data.description,
          team: data.team
        })
        setExistingPhotos(data.imageUrls || [])
      })
      .catch((error) => {
        console.error("게시글 조회 실패:", error)
        alert("게시글 정보를 불러오지 못했습니다.")
      })
      .finally(() => setLoading(false))
  }, [params.id])

  // 입력값 변경
  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // 새 이미지 업로드 완료 시 콜백
  function handleUploaded(uploadResult) {
    setNewPhotoIds(uploadResult.photoIds)
  }

  // 수정 버튼 클릭 시
  function handleSubmit(event) {
    event.preventDefault()

    const updateData = {
      title: form.title,
      description: form.description,
      price: parseInt(form.price),
      team: form.team
    }

    if (newPhotoIds !== undefined) {
      updateData.photoIds = newPhotoIds
    }

    updateUsedItem(params.id, updateData)
      .then(() => {
        alert("게시글이 수정되었습니다!")
        navigate("/useditem/" + params.id)
      })
      .catch((error) => {
        console.error("수정 실패:", error)
        alert("게시글 수정 중 오류가 발생했습니다.")
      })
  }

  if (loading) return <p>로딩 중...</p>

  return (
    <div className="edit-container">
      {/* 헤더 */}
      <div className="edit-header">
        <button onClick={() => navigate("/useditem")} className="edit-back-btn">
          ←
        </button>
        <h1 className="edit-header-title">상품 정보 수정</h1>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
        {/* 제목 */}
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="제목을 입력하세요"
          required
          className="edit-input-field"
        />

        {/* 가격 */}
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="가격을 입력하세요"
          required
          className="edit-input-field"
        />

        {/* 설명 */}
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="상품 설명을 입력하세요"
          required
          className="edit-textarea-field"
        ></textarea>

        {/* 팀 선택 */}
        <select
          name="team"
          value={form.team}
          onChange={handleChange}
          required
          className="edit-select"
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

        {/* 기존 이미지 */}
        <div className="edit-images">
          <h4>기존 이미지</h4>
          {existingPhotos.length > 0 ? (
            <div className="edit-image-list">
              {existingPhotos.map((url, index) => (
                <div key={index} className="edit-image-item">
                  <img
                    src={url}
                    alt={"기존 이미지-" + index}
                    className="edit-image-preview"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="edit-text">기존 이미지가 없습니다.</p>
          )}
        </div>

        {/* 새 이미지 업로더 */}
        <div style={{ marginTop: "0.5rem" }}>
          <PhotoUploader onUploaded={handleUploaded} />
        </div>

        {/* 버튼 */}
        <div className="edit-button-group">
          <button type="submit" className="edit-text-btn">
            수정 완료
          </button>
          <button
            type="button"
            className="edit-text-btn"
            onClick={() => navigate("/useditem/" + params.id)}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}

export default UsedItemEdit
