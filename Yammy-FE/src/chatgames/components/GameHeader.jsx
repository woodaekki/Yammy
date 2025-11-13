import React from "react";
import "../styles/GameHeader.css";

export default function GameHeader({ room, navigate }) {
  if (!room) {
    return (
      <div className="game-header">
        {navigate && (
          <button onClick={() => navigate(-1)} className="chat-list-back-btn">
            ←
          </button>
        )}
        <p className="loading">경기 정보를 불러오는 중...</p>
      </div>
    );
  }

  const { homeTeam, awayTeam, name, startAt, status } = room;
  const formattedTime = new Date(startAt).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="game-header">
      {/* 상단 띠 (홈팀 / 원정팀 컬러) */}
      <div className="team-bar">
        <div className="home-bar"></div>
        <div className="away-bar"></div>
      </div>
      

      {/* 본문 정보 */}
      <div className="game-info">
        <div className="game-teams">
          {/* 뒤로가기 버튼 */}
          {navigate && (
            <button onClick={() => navigate(-1)} className="chat-list-back-btn">
              ←
            </button>
          )}
          <span className="team home">{homeTeam}</span>
          <span className="vs">VS</span>
          <span className="team away">{awayTeam}</span>
        </div>

        <h2 className="game-title">{name}</h2>

        <div className="game-meta">
          <span className="game-time">{formattedTime}</span>
          <span
            className={`game-status ${
              status === "ACTIVE" ? "active" : "finished"
            }`}
          >
            {status === "ACTIVE" ? "진행 중" : "종료"}
          </span>
        </div>
      </div>
    </div>
  );
}
