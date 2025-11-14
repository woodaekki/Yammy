import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUsedItemById, updateUsedItem } from "../api/usedItemApi";
import { getTeamColors } from "../../sns/utils/teamColors";
import PhotoUploader from "../components/PhotoUploader";
import "../styles/usedItemEdit.css";

function UsedItemEdit() {
  const params = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    team: "",
  });
  const [errors, setErrors] = useState({
    title: "",
    price: "",
    description: "",
    team: "",
    photo: "",
  });

  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotoIds, setNewPhotoIds] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [teamColors, setTeamColors] = useState(getTeamColors());

  // ✅ 게시글 불러오기
  useEffect(() => {
    getUsedItemById(params.id)
      .then((data) => {
        setForm({
          title: data.title,
          price: data.price,
          description: data.description,
          team: data.team,
        });
        setExistingPhotos(data.imageUrls || []);
      })
      .catch((error) => {
        console.error("게시글 조회 실패:", error);
        alert("게시글 정보를 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
  }, [params.id]);

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

      case "team":
        if (!value) message = "팀을 선택해주세요.";
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  // 입력 변경 시
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  // 이미지 업로드 완료 시
  function handleUploaded(uploadResult) {
    setNewPhotoIds(uploadResult.photoIds);
  }

  // 수정 버튼 클릭 시
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 모든 필드 검증
    validate("title", form.title);
    validate("price", form.price);
    validate("description", form.description);
    validate("team", form.team);

    if (
      Object.values(errors).some((msg) => msg) ||
      !form.title ||
      !form.price ||
      !form.description ||
      !form.team
    ) {
      alert("입력 조건을 모두 충족해야 합니다.");
      return;
    }

    const updateData = {
      title: form.title,
      description: form.description,
      price: parseInt(form.price),
      team: form.team,
    };

    if (newPhotoIds !== undefined) updateData.photoIds = newPhotoIds;

    try {
      await updateUsedItem(params.id, updateData);
      alert("게시글이 수정되었습니다!");
      navigate("/useditem/" + params.id);
    } catch (error) {
      console.error("수정 실패:", error);
      alert("게시글 수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="edit-container">
      {/* 헤더 */}
      <div className="edit-header">
        <button onClick={() => navigate("/useditem/" + params.id)} className="edit-back-btn">
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
          className="edit-input-field"
        />
        {errors.title && <p className="edit-error-text">{errors.title}</p>}

        {/* 가격 */}
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="가격을 입력하세요"
          className="edit-input-field"
        />
        {errors.price && <p className="edit-error-text">{errors.price}</p>}

        {/* 설명 */}
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="상품 설명을 입력하세요"
          className="edit-textarea-field"
        ></textarea>
        {errors.description && <p className="edit-error-text">{errors.description}</p>}

        {/* 팀 선택 */}
        <select
          name="team"
          value={form.team}
          onChange={handleChange}
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
        {errors.team && <p className="edit-error-text">{errors.team}</p>}

        {/* 기존 이미지 */}
        <div className="edit-images">
          <h4>기존 이미지</h4>
          {existingPhotos.length > 0 ? (
            <div className="edit-image-list">
              {existingPhotos.map((url, index) => (
                <div key={index} className="edit-image-item">
                  <img src={url} alt={`기존 이미지-${index}`} className="edit-image-preview" />
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
          <button
            type="submit"
            className="edit-submit-btn"
            style={{
              backgroundColor: teamColors.bgColor,
              color: teamColors.textColor,
            }}
          >
            수정 완료
          </button>
          <button
            type="button"
            className="edit-cancel-btn"
            onClick={() => navigate("/useditem/" + params.id)}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default UsedItemEdit;
