import { useState } from "react";
import "../styles/MessageItem.css";

export default function MessageItem({ message, onImageClick }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="message-item">
      <div className="message-bubble">
        {!imageLoaded && (
          <div className="image-loading">
            <div className="spinner"></div>
          </div>
        )}
        <img
          src={message.imageUrl}
          alt="message"
          className={`message-image ${imageLoaded ? "visible" : "hidden"}`}
          onLoad={() => setImageLoaded(true)}
          onClick={() => onImageClick && onImageClick(message.imageUrl)}
        />
      </div>

      <div className="message-info">
        <span className="message-user">{message.nickname}</span>
        <span className="message-time">
          {message.createdAt?.toLocaleString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
