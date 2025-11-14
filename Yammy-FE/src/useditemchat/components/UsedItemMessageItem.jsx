import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import useAuthStore from "../../stores/authStore";
import EscrowMessageItem from "./EscrowMessageItem";
import "../styles/UsedItemMessageItem.css";

export default function UsedItemMessageItem({ message }) {
  const user = useAuthStore((state) => state.user);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  const isMine = user && message.uid === String(user.memberId);

  // === 이미지 확대 시 body 스크롤 잠금 ===
  useEffect(() => {
    if (zoomImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [zoomImage]);

  // 에스크로 메시지 처리
  if (message.type === "escrow") {
    return <EscrowMessageItem message={message} isMine={isMine} />;
  }

  if (!message || (!message.message && !message.imageUrl)) return null;

  return (
    <>
      <div className={`chat-row ${isMine ? "mine" : "theirs"}`}>
        <div className="chat-content">
          <span className="chat-nickname">
            {message.nickname || (isMine ? user?.nickname : "")}
          </span>

          <div className="chat-bubble-wrapper">
            <div className={`chat-bubble ${isMine ? "mine" : "theirs"}`}>
              {message.type === "text" && (
                <p className="chat-text">{message.message}</p>
              )}

              {message.type === "image" && message.imageUrl && (
                <div className="chat-image-wrapper">
                  {!imageLoaded && (
                    <div className="chat-image-loading">
                      <div className="chat-spinner"></div>
                    </div>
                  )}

                  <img
                    src={message.imageUrl}
                    alt="msg"
                    className={`chat-image ${imageLoaded ? "visible" : ""}`}
                    onLoad={() => setImageLoaded(true)}
                    onClick={() => setZoomImage(message.imageUrl)}
                  />
                </div>
              )}
            </div>

            <span className="chat-time">
              {message.createdAt
                ? new Date(message.createdAt).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : ""}
            </span>
          </div>
        </div>
      </div>

      {/* === 이미지 확대 모달 (Portal 적용) === */}
      {zoomImage &&
        createPortal(
          <div
            className="chat-image-overlay"
            onClick={(e) => {
              if (e.target.classList.contains("chat-image-overlay")) {
                setZoomImage(null);
              }
            }}
          >
            <div className="chat-image-wrapper-zoom">
              <button
                className="chat-image-close"
                onClick={() => setZoomImage(null)}
              >
                ✕
              </button>

              <img
                src={zoomImage}
                alt="zoomed"
                className="chat-image-zoomed"
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
