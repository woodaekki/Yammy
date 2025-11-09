import { useState } from 'react';
import { getTeamColors } from '../../sns/utils/teamColors';
import '../styles/TicketCard.css';

// 팀별 티켓 배경 이미지 매핑
import lgtwinsTicket from '../../assets/images/tickets/lgtwins.png';
import doosanTicket from '../../assets/images/tickets/doosan.png';
import kiwoomTicket from '../../assets/images/tickets/kiwoom.png';
import hanwhaTicket from '../../assets/images/tickets/hanwha.png';
import ktwizTicket from '../../assets/images/tickets/ktwiz.png';
import ncTicket from '../../assets/images/tickets/nc.png';
import kiaTicket from '../../assets/images/tickets/kia.png';
import samsungTicket from '../../assets/images/tickets/samsung.png';
import lotteTicket from '../../assets/images/tickets/lotte.png';
import ssgTicket from '../../assets/images/tickets/ssg.png';

const TICKET_BACKGROUNDS = {
    'LG': lgtwinsTicket,
    '두산': doosanTicket,
    '키움': kiwoomTicket,
    '한화': hanwhaTicket,
    'KT': ktwizTicket,
    'NC': ncTicket,
    'KIA': kiaTicket,
    '삼성': samsungTicket,
    '롯데': lotteTicket,
    'SSG': ssgTicket
};

const TicketCard = ({ ticket }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const teamColors = getTeamColors();

    // 경기명에서 팀 추출 (예: "LG vs KT" -> "LG")
    const getTeamFromGame = (game) => {
        if (!game) return null;
        const teams = ['LG', '두산', '키움', '한화', 'KT', 'NC', 'KIA', '삼성', '롯데', 'SSG'];
        for (const team of teams) {
            if (game.includes(team)) {
                return team;
            }
        }
        return null;
    };

    const team = getTeamFromGame(ticket.game);
    const ticketBackground = team ? TICKET_BACKGROUNDS[team] : null;

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="ticket-card-container" onClick={handleFlip}>
            <div className={`ticket-card ${isFlipped ? 'flipped' : ''}`}>
                {/* 앞면 */}
                {ticketBackground ? (
                    <div
                        className="ticket-front"
                        style={{
                            '--team-color': teamColors.bgColor,
                            '--team-text-color': teamColors.textColor,
                            width: '100%',
                            height: 'auto',
                            position: 'relative'
                        }}
                    >
                        <img
                            src={ticketBackground}
                            alt="티켓"
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block'
                            }}
                        />
                    </div>
                ) : (
                    <div
                        className="ticket-front"
                        style={{
                            '--team-color': teamColors.bgColor,
                            '--team-text-color': teamColors.textColor,
                            aspectRatio: '1 / 1.4'
                        }}
                    >
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <h2>{ticket.game || 'GAME TICKET'}</h2>
                            <p>{ticket.comment}</p>
                            <p>{ticket.date}</p>
                            <p>{ticket.location}</p>
                            {(ticket.photoUrl || ticket.photoPreview) && (
                                <img
                                    src={ticket.photoUrl || ticket.photoPreview}
                                    alt="업로드 사진"
                                    style={{
                                        width: '100%',
                                        maxWidth: '200px',
                                        marginTop: '20px',
                                        borderRadius: '8px'
                                    }}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* 뒷면 */}
                {ticketBackground ? (
                    <div
                        className="ticket-back"
                        style={{
                            '--team-color': teamColors.bgColor,
                            '--team-text-color': teamColors.textColor,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: 'auto'
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <img
                                src={ticketBackground}
                                alt="티켓 배경"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block',
                                    opacity: 0.5
                                }}
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{
                                    position: 'relative',
                                    zIndex: 1,
                                    margin: '20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxHeight: 'calc(100% - 40px)'
                                }}>
                                    <div className="ticket-back-header">
                        <h3>{ticket.game}</h3>
                        <p className="ticket-subtitle">관람 티켓</p>
                    </div>

                    <div className="ticket-back-content">
                        {/* 직관사진 항목 */}
                        {(ticket.photoUrl || ticket.photoPreview) && (
                            <div className="info-row" style={{
                                display: 'block',
                                paddingBottom: '16px',
                                borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                            }}>
                                <span className="info-label" style={{ display: 'block', marginBottom: '8px' }}>직관사진</span>
                                <div style={{
                                    width: '100%',
                                    borderRadius: '0',
                                    overflow: 'hidden'
                                }}>
                                    <img
                                        src={ticket.photoUrl || ticket.photoPreview}
                                        alt="직관사진"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            display: 'block'
                                        }}
                                    />
                                </div>
                            </div>
                        )}

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
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        className="ticket-back"
                        style={{
                            '--team-color': teamColors.bgColor,
                            '--team-text-color': teamColors.textColor
                        }}
                    >
                        <div className="ticket-back-header">
                            <h3>{ticket.game}</h3>
                            <p className="ticket-subtitle">관람 티켓</p>
                        </div>
                        <div className="ticket-back-content">
                            <p>티켓 정보</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketCard;
