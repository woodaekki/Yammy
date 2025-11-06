import "../styles/GameHeader.css";

export default function GameHeader({ room }) {
  if (!room) {
    return (
      <div className="game-header loading">
        <div className="skeleton title"></div>
        <div className="skeleton subtitle"></div>
      </div>
    );
  }

  const statusConfig = {
    DRAFT: { text: "준비 중", color: "gray" },
    ACTIVE: { text: "진행 중", color: "green" },
    CANCELED: { text: "취소됨", color: "red" },
  };

  const status = statusConfig[room.status] || statusConfig.DRAFT;

  const teamColors = {
    KIA: "#E41E26",
    LG: "#3C1361",
    DOOSAN: "#0C2340",
    SSG: "#E31937",
    LOTTE: "#002D62",
    NC: "#1D428A",
    KT: "#C8102E",
    HANWHA: "#FF5F00",
    SAMSUNG: "#0047AB",
    KIWOOM: "#76232F",
    DEFAULT: "#9CA3AF",
  };

  const homeColor = teamColors[room.homeTeam] || teamColors.DEFAULT;
  const awayColor = teamColors[room.awayTeam] || teamColors.DEFAULT;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="game-header-wrapper">
      <div
        className="team-band"
        style={{
          background: `linear-gradient(to right, ${homeColor} 50%, ${awayColor} 50%)`,
        }}
      />
      <div className="game-header">
        <div className="game-header-teams">
          <div className="team-block">
            <div className="team-circle" style={{ backgroundColor: homeColor }} />
            <span className="team-name">{room.homeTeam || "홈팀"}</span>
          </div>

          <div className="vs-circle">VS</div>

          <div className="team-block">
            <span className="team-name">{room.awayTeam || "원정팀"}</span>
            <div className="team-circle" style={{ backgroundColor: awayColor }} />
          </div>
        </div>

        <div className="game-header-info">
          <h2 className="game-title">{room.name}</h2>
          <p className="game-date">{formatDate(room.startAt)}</p>
        </div>

        <div className={`game-status ${status.color}`}>{status.text}</div>
      </div>
    </div>
  );
}
