import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeamColors, TEAM_COLORS } from '../../sns/utils/teamColors';
import { TEAM_LOGOS } from '../../utils/teamLogos';
import { getTickets } from '../api/ticketApi';
import TicketCard, { parseGameTeams } from '../components/TicketCard';
import '../styles/TicketListPage.css';

const TicketListPage = () => {
    const navigate = useNavigate();
    const teamColors = getTeamColors();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTeamFilter, setSelectedTeamFilter] = useState('전체');

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

    const handleNftMinted = (ticketId, nftResponse) => {
        setTickets(prevTickets =>
            prevTickets.map(ticket =>
                ticket.id === ticketId
                    ? {
                        ...ticket,
                        nftMinted: true,
                        nftTokenId: nftResponse.tokenId,
                        nftTransactionHash: nftResponse.transactionHash
                    }
                    : ticket
            )
        );
    };

    // 팀별 필터링된 티켓 목록
    const filteredTickets = selectedTeamFilter === '전체'
        ? tickets
        : tickets.filter(ticket => {
            if (!ticket.game) return false;
            const teams = parseGameTeams(ticket.game);
            if (!teams) return false;
            return teams.some(team => team.name === selectedTeamFilter);
        });

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

            {/* 팀 필터 */}
            <div className="team-filter-container">
                <button
                    className={`team-filter-btn ${selectedTeamFilter === '전체' ? 'active' : ''}`}
                    onClick={() => setSelectedTeamFilter('전체')}
                >
                    전체
                </button>
                {['LG 트윈스', '한화 이글스', 'SSG 랜더스', '삼성 라이온즈', 'NC 다이노스',
                    'KT 위즈', '롯데 자이언츠', 'KIA 타이거즈', '두산 베어스', '키움 히어로즈']
                    .map((teamName) => (
                        <button
                            key={teamName}
                            className={`team-filter-btn ${selectedTeamFilter === teamName ? 'active' : ''}`}
                            style={{
                                backgroundColor: selectedTeamFilter === teamName ? TEAM_COLORS[teamName].bgColor : 'white',
                                color: selectedTeamFilter === teamName ? TEAM_COLORS[teamName].textColor : '#374151',
                                borderColor: TEAM_COLORS[teamName].bgColor,
                            }}
                            onClick={() => setSelectedTeamFilter(teamName)}
                        >
                            <img
                                src={TEAM_LOGOS[teamName]}
                                alt={teamName}
                                className="team-filter-logo"
                            />
                            {teamName.split(' ')[0]}
                        </button>
                    ))}
            </div>

            {/* 티켓 그리드 */}
            <div className="tickets-container">
                {loading ? (
                    <div className="loading-message">티켓을 불러오는 중...</div>
                ) : filteredTickets.length === 0 ? (
                    <div className="empty-message">
                        <div className="empty-icon">🎫</div>
                        <p>
                            {selectedTeamFilter === '전체'
                                ? '아직 발급된 티켓이 없어요'
                                : `${selectedTeamFilter} 티켓이 없어요`}
                        </p>
                        {selectedTeamFilter === '전체' && (
                            <button
                                className="create-first-ticket-btn"
                                onClick={() => navigate('/ticket/create')}
                                style={{ backgroundColor: teamColors.bgColor }}
                            >
                                첫 티켓 발급하기
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="tickets-grid">
                        {filteredTickets.map(ticket => (
                            <div key={ticket.id} className="ticket-item">
                                <TicketCard ticket={ticket} onNftMinted={handleNftMinted} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketListPage;
