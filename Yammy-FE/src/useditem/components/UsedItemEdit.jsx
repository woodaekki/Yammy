import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getUsedItemById, updateUsedItem } from "../api/usedItemApi"
import PhotoUploader from "../components/PhotoUploader"
import "../styles/useditem.css"

function UsedItemEdit() {
  const params = useParams()
  const navigate = useNavigate()

  // 게시글 기본 정보
  const [form, setForm] = useState({
    title: "",
    price: "",
    description: ""
  })

  const [existingPhotos, setExistingPhotos] = useState([])
  const [newPhotoIds, setNewPhotoIds] = useState([])
  const [loading, setLoading] = useState(true)

  // 게시글 불러오기
  useEffect(function () {
    getUsedItemById(params.id)
      .then(function (data) {
        setForm({
          title: data.title,
          price: data.price,
          description: data.description
        })
        setExistingPhotos(data.imageUrls || [])
      })
      .catch(function (error) {
        console.error("게시글 조회 실패:", error)
        alert("게시글 정보를 불러오지 못했습니다.")
      })
      .finally(function () {
        setLoading(false)
      })
  }, [params.id])

  // 입력값 변경
  function handleChange(event) {
    const name = event.target.name
    const value = event.target.value
    setForm(function (prev) {
      return { ...prev, [name]: value }
    })
  }

  // 새 이미지 업로드 시 콜백
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
      photoIds: newPhotoIds
    }

    updateUsedItem(params.id, updateData)
      .then(function () {
        alert("게시글이 수정되었습니다!")
        navigate("/useditem/" + params.id)
      })
      .catch(function (error) {
        console.error("수정 실패:", error)
        alert("게시글 수정 중 오류가 발생했습니다.")
      })
  }

  if (loading) {
    return <p>로딩 중...</p>
  }

  return (
    <div className="edit-container">
       <div className="detail-header">
        <button
          onClick={function () {
            navigate("/useditem")
          }}
          className="back-btn"
        >
          ←
        </button>
        <h1 className="header-title">게시글 수정</h1>
        <div className="header-space"></div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 제목 */}
        <input name="title" value={form.title} onChange={handleChange} placeholder="제목" required className="input-field" />
        
        {/* 가격 */}
        <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="가격" required className="input-field" />
        
        {/* 설명 */}
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="설명" required className="textarea-field"></textarea>

        {/* 기존 이미지 */}
        <div className="existing-images">
          <h4>기존 이미지</h4>
          {existingPhotos.length > 0 ? (
            <div className="image-preview-list">
              {existingPhotos.map(function (url, index) {
                return (
                  <div key={index} className="image-preview-item">
                    <img
                      src={url}
                      alt={"기존 이미지-" + index}
                      className="preview-img"
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <p>기존 이미지가 없습니다.</p>
          )}
        </div>

        {/* 새 이미지 업로더 */}
        <div style={{ marginTop: "1rem" }}>
          <PhotoUploader onUploaded={handleUploaded} />
        </div>

        {/* 버튼 */}
        <div className="button-group">
          <button type="submit" className="edit-btn">
            수정 완료
          </button>
          <button
            type="button" className="delete-btn" 
            onClick={function () {
              navigate("/useditem")
            }}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}

export default UsedItemEdit
