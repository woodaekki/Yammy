import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createUsedItem } from "../api/usedItemApi"
import PhotoUploader from "../components/PhotoUploader"
import "../styles/usedItem.css"

function UsedItemCreate() {
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [photoIds, setPhotoIds] = useState([])

  function handleUploaded(result) {
    setPhotoIds(result.photoIds)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!title || !price || !description) {
      alert("모든 항목을 입력해주세요")
      return
    }

    const newItem = {
      title: title,
      price: parseInt(price),
      description: description,
      photoIds: photoIds
    }

    try {
      await createUsedItem(newItem)
      alert("게시글이 등록되었습니다.")
      navigate("/useditem")
    } catch (err) {
      alert("등록 중 오류가 발생했습니다.")
      console.error(err)
    }
  }

  return (
    <div className="useditem-create-container">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate("/useditem")}>←</button>
        <h1 className="header-title">게시글 등록</h1>
        <div className="header-space" />
      </div>

      {/* 작성 폼 */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="input-field"
        />

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="가격을 입력하세요"
          className="input-field"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="상품 설명을 입력하세요"
          className="textarea-field"
        />

        <PhotoUploader onUploaded={handleUploaded} />

        <button type="submit" className="submit-btn">등록하기</button>
      </form>
    </div>
  )
}

export default UsedItemCreate
