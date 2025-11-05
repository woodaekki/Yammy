import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeamColors } from '../../sns/utils/teamColors';
import { getTickets } from '../api/ticketApi';
import TicketCard from '../components/TicketCard';
import '../styles/TicketListPage.css';

const TicketListPage = () => {
    const navigate = useNavigate();
    const teamColors = getTeamColors();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const response = await getTickets();
            setTickets(response);
        } catch (error) {
            console.error('티켓 목록 불러오기 실패:', error);
            // 에러 발생 시 빈 배열 설정
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="ticket-list-page"
            style={{
                '--team-color': teamColors.bgColor,
                '--team-text-color': teamColors.textColor
            }}
        >
            {/* 헤더 */}
            <div className="ticket-list-header" style={{ backgroundColor: teamColors.bgColor }}>
                <button onClick={() => navigate(-1)} className="back-btn" style={{ color: teamColors.textColor }}>
                    ←
                </button>
                <h1 className="header-title" style={{ color: teamColors.textColor }}>나의 티켓</h1>
                <button
                    className="create-ticket-btn"
                    onClick={() => navigate('/ticket/create')}
                    style={{ color: teamColors.textColor }}
                >
                    +
                </button>
            </div>

            {/* 안내 문구 */}
            <div className="ticket-info">
                <p>💡 티켓을 클릭하면 뒷면을 확인할 수 있어요</p>
            </div>

            {/* 티켓 그리드 */}
            <div className="tickets-container">
                {loading ? (
                    <div className="loading-message">티켓을 불러오는 중...</div>
                ) : tickets.length === 0 ? (
                    <div className="empty-message">
                        <div className="empty-icon">🎫</div>
                        <p>아직 발급된 티켓이 없어요</p>
                        <button
                            className="create-first-ticket-btn"
                            onClick={() => navigate('/ticket/create')}
                            style={{ backgroundColor: teamColors.bgColor }}
                        >
                            첫 티켓 발급하기
                        </button>
                    </div>
                ) : (
                    <div className="tickets-grid">
                        {tickets.map(ticket => (
                            <div key={ticket.id} className="ticket-item">
                                <TicketCard ticket={ticket} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketListPage;
