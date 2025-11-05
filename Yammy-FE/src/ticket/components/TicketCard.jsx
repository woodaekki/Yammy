import { useState } from 'react';
import { getTeamColors } from '../../sns/utils/teamColors';
import '../styles/TicketCard.css';

const TicketCard = ({ ticket }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const teamColors = getTeamColors();

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="ticket-card-container" onClick={handleFlip}>
            <div className={`ticket-card ${isFlipped ? 'flipped' : ''}`}>
                {/* 앞면 */}
                <div
                    className="ticket-front"
                    style={{
                        '--team-color': teamColors.bgColor,
                        '--team-text-color': teamColors.textColor
                    }}
                >
                    <div className="ticket-perforated-edge"></div>
                    <div className="ticket-image-section">
                        {ticket.photoPreview ? (
                            <img src={ticket.photoPreview} alt="티켓 사진" />
                        ) : (
                            <div className="ticket-placeholder">📷</div>
                        )}
                    </div>
                    <div className="ticket-front-info">
                        <h2 className="ticket-title">{ticket.game || 'GAME TICKET'}</h2>
                        <p className="ticket-comment">{ticket.comment}</p>
                        <div className="ticket-front-details">
                            <div className="detail-item">
                                <span className="detail-label">DATE</span>
                                <span className="detail-value">{ticket.date}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">LOCATION</span>
                                <span className="detail-value">{ticket.location}</span>
                            </div>
                        </div>
                    </div>
                    <div className="ticket-decoration">
                        <div className="decoration-line"></div>
                        <div className="decoration-circles">
                            <span>○</span>
                            <span>○</span>
                            <span>○</span>
                            <span>○</span>
                            <span>○</span>
                        </div>
                    </div>
                </div>

                {/* 뒷면 */}
                <div
                    className="ticket-back"
                    style={{
                        '--team-color': teamColors.bgColor,
                        '--team-text-color': teamColors.textColor
                    }}
                >
                    <div className="ticket-perforated-edge"></div>
                    <div className="ticket-back-header">
                        <h3>{ticket.game}</h3>
                        <p className="ticket-subtitle">관람 티켓</p>
                    </div>

                    <div className="ticket-back-content">
                        <div className="info-row">
                            <span className="info-label">날짜</span>
                            <span className="info-value">{ticket.date}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">장소</span>
                            <span className="info-value">{ticket.location}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">좌석</span>
                            <span className="info-value">{ticket.seat}</span>
                        </div>

                        {ticket.type && (
                            <div className="info-row">
                                <span className="info-label">종목</span>
                                <span className="info-value">{ticket.type}</span>
                            </div>
                        )}

                        {(ticket.awayScore || ticket.homeScore) && (
                            <div className="info-row score-row">
                                <span className="info-label">스코어</span>
                                <span className="info-value score-value">
                                    {ticket.awayScore} : {ticket.homeScore}
                                </span>
                            </div>
                        )}

                        <div className="info-row comment-row">
                            <span className="info-label">한줄평</span>
                            <span className="info-value">{ticket.comment}</span>
                        </div>

                        {ticket.review && (
                            <div className="review-section">
                                <span className="info-label">상세 리뷰</span>
                                <p className="review-text">{ticket.review}</p>
                            </div>
                        )}
                    </div>

                    <div className="ticket-back-footer">
                        <div className="barcode">
                            <div className="barcode-lines">
                                {Array.from({ length: 30 }).map((_, i) => (
                                    <span key={i}></span>
                                ))}
                            </div>
                            <p>NO. {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketCard;
