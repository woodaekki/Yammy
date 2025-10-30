import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUsedItem } from "../api/usedItemApi";
import PhotoUploader from "../components/PhotoUploader";
import "../styles/useditem.css";

function UsedItemCreate() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [photoIds, setPhotoIds] = useState([]);

  // 에러 메시지 상태
  const [errors, setErrors] = useState({
    title: "",
    price: "",
    description: "",
    photo: "",
  });

  // 실시간 유효성 검사
  const validate = (field, value) => {
    let message = "";

    switch (field) {
      case "title":
        if (value.length < 2) message = "제목은 최소 2자 이상이어야 합니다.";
        else if (value.length > 50) message = "제목은 50자 이하로 작성해주세요.";
        break;

      case "price":
        if (value === "") message = "가격을 입력해주세요.";
        else if (value < 0) message = "가격은 0원 이상이어야 합니다.";
        else if (value > 1000000000) message = "가격은 10억원 이하로 입력해주세요.";
        break;

      case "description":
        if (value.length < 10) message = "설명은 최소 10자 이상이어야 합니다.";
        else if (value.length > 1000) message = "설명은 1,000자 이하로 작성해주세요.";
        break;

      case "photo":
        if (value.length > 3) message = "이미지는 최대 3장까지만 등록 가능합니다.";
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  function handleUploaded(result) {
    setPhotoIds(result.photoIds);
    validate("photo", result.photoIds);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // 전체 유효성 검사 실행
    validate("title", title);
    validate("price", price);
    validate("description", description);
    validate("photo", photoIds);

    // 하나라도 유효하지 않으면 제출 불가능
    if (Object.values(errors).some((msg) => msg)) {
      alert("입력 조건을 모두 충족해야 합니다.");
      return;
    }

    const newItem = {
      title: title,
      price: parseInt(price),
      description: description,
      photoIds: photoIds,
    };

    try {
      await createUsedItem(newItem);
      alert("게시글이 등록되었습니다.");
      navigate("/useditem");
    } catch (err) {
      alert("등록 중 오류가 발생했습니다.");
      console.error(err);
    }
  }

  return (
    <div className="useditem-create-container">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate("/useditem")}>←</button>
        <h1 className="header-title">게시글 등록</h1>
        <div className="header-space" />
      </div>

      <form onSubmit={handleSubmit}>
        {/* 제목 */}
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            validate("title", e.target.value);
          }}
          placeholder="제목을 입력하세요"
          className="input-field"
        />
        {errors.title && <p className="error-text">{errors.title}</p>}

        {/* 가격 */}
        <input
          type="number"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            validate("price", e.target.value);
          }}
          placeholder="가격을 입력하세요"
          className="input-field"
        />
        {errors.price && <p className="error-text">{errors.price}</p>}

        {/* 설명 */}
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            validate("description", e.target.value);
          }}
          placeholder="상품 설명을 입력하세요"
          className="textarea-field"
        />
        {errors.description && <p className="error-text">{errors.description}</p>}

        {/* 이미지 업로더 */}
        <PhotoUploader onUploaded={handleUploaded} />
        {errors.photo && <p className="error-text">{errors.photo}</p>}

        <button
          type="submit"
          className="submit-btn"
          disabled={Object.values(errors).some((msg) => msg)}
        >
          등록
        </button>
      </form>
    </div>
  );
}

export default UsedItemCreate;
