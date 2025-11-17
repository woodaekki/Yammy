import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUsedItemById, deleteUsedItem } from "../api/usedItemApi";
import { getTeamColors } from "../../sns/utils/teamColors";
import { usedItemChatApi } from "../../useditemchat/api/usedItemChatApi";
import "../styles/usedItemDetail.css";
import empty from "../../assets/images/empty.png"

function UsedItemDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const myId = localStorage.getItem("memberId");
  const [teamColors, setTeamColors] = useState(getTeamColors());
  const [isChatLoading, setIsChatLoading] = useState(false);
  // 팀 컬러 초기 설정
  useEffect(() => {
    setTeamColors(getTeamColors());
  }, []);

  // 상품 상세 불러오기
  useEffect(() => {
    getUsedItemById(params.id)
      .then((data) => setItem(data))
      .catch((error) => console.error("게시글 불러오기 실패:", error))
      .finally(() => setLoading(false));
  }, [params.id]);

  // 시간 포맷 함수 (한국 시간 기준)
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const now = new Date();
    const diffInMs = now - koreaTime;
   
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInHours < 24) return `${diffInHours}시간 전`
    if (diffInDays < 7) return `${diffInDays}일 전`
    return koreaTime.toLocaleDateString('ko-KR')
  }

  // 수정
  const handleEdit = () => navigate(`/useditem/edit/${params.id}`)

  // 채팅방 입장
  const handleChat = async () => {
    if (isChatLoading) return; // 이미 처리 중이면 무시
    
    try {
      setIsChatLoading(true); // 로딩 시작
      const chatRoom = await usedItemChatApi.createOrEnterChatRoom(params.id)
      navigate(`/useditem/chat/${chatRoom.roomKey}`)
    } catch (error) {
      console.error("채팅방 생성 실패:", error)
      alert("채팅방 입장에 실패했습니다.");
    } finally {
      setIsChatLoading(false); // 로딩 종료
    }
  };

  // 삭제
  const handleDelete = () => {
    const confirmed = window.confirm("정말 이 게시글을 삭제하시겠습니까?")
    if (!confirmed) return;
    deleteUsedItem(params.id)
      .then(() => {
        alert("게시글이 삭제되었습니다.")
        navigate("/useditem")
      })
      .catch((error) => {
        console.error("삭제 실패:", error);
        alert("삭제 중 오류가 발생했습니다.")
      });
  };

  // 로딩 / 데이터 없음 처리
  if (!item) return <p className="loading-text"></p>

  // 팀 이름 매핑
  const teamNames = {
    DOOSAN: "두산 베어스",
    LOTTE: "롯데 자이언츠",
    LG: "LG 트윈스",
    SSG: "SSG 랜더스",
    KIA: "KIA 타이거즈",
    HANWHA: "한화 이글스",
    SAMSUNG: "삼성 라이온즈",
    NC: "NC 다이노스",
    KT: "KT 위즈",
    KIWOOM: "키움 히어로즈",
  };

  return (
    <div className="detail-container">
      {/* 상단 헤더 */}
      <div className="detail-header">
        <button onClick={() => navigate("/useditem")} className="detail-back-btn">
          ←
        </button>
        <span className="detail-title">상품 상세</span>
      </div>

      {/* 이미지 슬라이더 */}
      <div className="detail-image-slider">
        {item.imageUrls?.length > 0 ? (
          <>
            {item.imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`${item.title}-${index}`}
                className={`detail-image ${index === currentIndex ? "active" : ""}`}
              />
            ))}
            <div className="detail-slider-dots">
              {item.imageUrls.map((_, index) => (
                <div
                  key={index}
                  className={`detail-slider-dot ${index === currentIndex ? "active" : ""}`}
                  onClick={() => setCurrentIndex(index)}
                ></div>
              ))}
            </div>
            {/* 썸네일 미리보기 */}
            <div className="detail-thumbnail-container">
              {item.imageUrls.map((url, index) => (
                <div
                  key={index}
                  className={`detail-thumbnail ${index === currentIndex ? "active" : ""}`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <img src={url} alt={`${item.title}-thumb-${index}`} />
                </div>
              ))}
            </div>
          </>
        ) : (
           <div className="no-image">
                <img src={empty} alt="이미지 없음" />
              </div>
        )}
      </div>

      {/* 본문 내용 */}
      <div className="detail-body">
        <h2 className="detail-item-title">{item.title}</h2>

        {/* 판매자 정보 */}
        <div className="detail-seller">
          <div className="detail-seller-left">
            <div className="detail-seller-avatar">
              {item.profileUrl ? (
                <img src={item.profileUrl} alt="프로필 이미지" />
              ) : (
                <div className="avatar-placeholder">⚾</div>
              )}
            </div>

            <div className="detail-seller-info">
              <p className="detail-nickname">{item.nickname || "익명"}</p>
              <p className="detail-date">
                {item.createdAt ? formatTimeAgo(item.createdAt) : "방금 전"}
              </p>
            </div>
          </div>

          <div className="detail-seller-actions">
            {item.memberId == myId ? (
              <>
                <button className="detail-text-btn" onClick={handleEdit}>
                  수정
                </button>
                <button className="detail-text-btn" onClick={handleDelete}>
                  삭제
                </button>
              </>
            ) : (
              <button 
                className="detail-chat-btn" 
                onClick={handleChat}
                disabled={isChatLoading}
              >
                {isChatLoading ? "입장 중..." : "채팅"}
              </button>
            )}
          </div>
        </div>

        {/* 가격 + 팀 태그 */}
        <div className="detail-price-team">
          <p className="detail-price">{item.price?.toLocaleString()} 얌</p>
          {item.team && (
            <p
              className="detail-team-tag"
              style={{
                backgroundColor: teamColors.bgColor,
                color: teamColors.textColor,
              }}
            >
              {teamNames[item.team] || item.team}
            </p>
          )}
        </div>

        {/* 상품 설명 */}
        <p className="detail-description">{item.description}</p>
      </div>
    </div>
  );
}

export default UsedItemDetail;