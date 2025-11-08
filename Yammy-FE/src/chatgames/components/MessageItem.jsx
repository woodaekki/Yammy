import { useState } from "react";
import "../styles/MessageItem.css";

export default function MessageItem({ message, onImageClick, isMine }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className={`message-item ${isMine ? "mine" : "other"}`}>
      {/* ✅ 내 닉네임도 항상 표시 */}
      <div className="message-info">
        <span className="message-user">{message.nickname}</span>
        <span className="message-time">
          {message.createdAt
            ? new Date(message.createdAt).toLocaleString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </span>
      </div>

      <div className={`message-bubble ${isMine ? "mine" : "other"}`}>
        {!imageLoaded && (
          <div className="image-loading">
            <div className="spinner"></div>
          </div>
        )}
        {message.imageUrl ? (
          <img
            src={message.imageUrl}
            alt="message"
            className={`message-image ${imageLoaded ? "visible" : "hidden"}`}
            onLoad={() => setImageLoaded(true)}
            onClick={() => onImageClick && onImageClick(message.imageUrl)}
          />
        ) : (
          <span>{message.text}</span>
        )}
      </div>
    </div>
  );
}
