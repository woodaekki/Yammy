import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeamColors, TEAM_COLORS } from '../../sns/utils/teamColors';
import { createTicket } from '../api/ticketApi';
import { getRecentMatches } from '../api/matchApi';
import '../styles/TicketCreatePage.css';

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
    'LG 트윈스': lgtwinsTicket,
    '두산 베어스': doosanTicket,
    '키움 히어로즈': kiwoomTicket,
    '한화 이글스': hanwhaTicket,
    'KT 위즈': ktwizTicket,
    'NC 다이노스': ncTicket,
    'KIA 타이거즈': kiaTicket,
    '삼성 라이온즈': samsungTicket,
    '롯데 자이언츠': lotteTicket,
    'SSG 랜더스': ssgTicket
};

const TicketCreatePage = () => {
    const navigate = useNavigate();
    const [selectedTeam, setSelectedTeam] = useState(localStorage.getItem('team') || null);
    const teamColors = selectedTeam ? TEAM_COLORS[selectedTeam] : { bgColor: '#4CAF50', textColor: '#ffffff' };
    const ticketBackground = selectedTeam ? TICKET_BACKGROUNDS[selectedTeam] : null;

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        matchcode: '',
        game: '',
        date: '',
        location: '',
        seat: '',
        comment: '',
        type: '',
        awayScore: '',
        homeScore: '',
        review: '',
        photo: null,
        photoPreview: null,
    });
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [matches, setMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);

    // 경기장 목록
    const stadiums = [
        '강릉종합운동장',
        '강화SSG퓨처스필드',
        '경남e스포츠상설경기장',
        '경민대학교 기념관',
        '경주축구공원',
        '계양체육관',
        '고양국기대표아구훈련장',
        '고양소노아레나',
        '고척스카이돔',
        '광양축구전용구장',
        '광주-기아챔피언스필드'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    photo: file,
                    photoPreview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLocationSelect = (stadium) => {
        setFormData(prev => ({
            ...prev,
            location: stadium
        }));
        setShowLocationModal(false);
    };

    const loadMatches = async () => {
        setLoadingMatches(true);
        try {
            const response = await getRecentMatches(0, 50);
            setMatches(response.content || response);
        } catch (error) {
            console.error('경기 목록 불러오기 실패:', error);
            setMatches([]);
        } finally {
            setLoadingMatches(false);
        }
    };

    const handleMatchModalOpen = () => {
        setShowMatchModal(true);
        if (matches.length === 0) {
            loadMatches();
        }
    };

    const handleMatchSelect = (match) => {
        setFormData(prev => ({
            ...prev,
            matchcode: match.matchcode,
            game: `${match.away} vs ${match.home}`,
            date: match.matchdate,
            location: match.place || '',
            awayScore: match.awayScore || '',
            homeScore: match.homeScore || '',
            type: '야구'
        }));
        setShowMatchModal(false);
    };

    const nextStep = () => {
        if (currentStep === 1) {
            if (!formData.game || !formData.date || !formData.location || !formData.seat || !formData.comment) {
                alert('모든 필수 항목을 입력해주세요.');
                return;
            }
        }
        if (currentStep === 2) {
            if (!formData.photoPreview) {
                alert('사진을 선택해주세요.');
                return;
            }
        }
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            await createTicket(formData);
            alert('티켓이 발급되었습니다!');
            navigate('/ticket/list');
        } catch (error) {
            console.error('티켓 발급 실패:', error);
            alert('티켓 발급에 실패했습니다.');
        }
    };

    return (
        <div
            className="ticket-create-page"
            style={{
                '--team-color': teamColors.bgColor,
                '--team-text-color': teamColors.textColor
            }}
        >
            {/* 헤더 */}
            <div className="ticket-header" style={{ backgroundColor: teamColors.bgColor }}>
                <button onClick={() => navigate(-1)} className="back-btn" style={{ color: teamColors.textColor }}>
                    ←
                </button>
                <h1 className="header-title" style={{ color: teamColors.textColor }}>티켓 발급</h1>
                <button
                    onClick={() => setShowTeamModal(true)}
                    className="team-select-btn"
                    style={{ color: teamColors.textColor }}
                    title="팀 변경"
                >
                    {selectedTeam ? selectedTeam.split(' ')[0] : '팀선택'}
                </button>
            </div>

            {/* 진행 단계 */}
            <div className="progress-steps">
                <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                    <div className="step-circle">✓</div>
                    <div className="step-label">경기결과</div>
                </div>
                <div className="step-line"></div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                    <div className="step-circle">✗</div>
                    <div className="step-label">사진선택</div>
                </div>
                <div className="step-line"></div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                    <div className="step-circle">✗</div>
                    <div className="step-label">필수정보</div>
                </div>
            </div>

            {/* 단계별 폼 */}
            <div className="ticket-form-container">
                {/* 1단계: 경기결과 */}
                {currentStep === 1 && (
                    <div className="form-step">
                        <div className="form-group">
                            <label>Game*</label>
                            <input
                                type="text"
                                name="game"
                                value={formData.game}
                                onChange={handleChange}
                                onClick={handleMatchModalOpen}
                                placeholder="KBO 경기를 선택하거나 직접 입력하세요"
                                readOnly
                            />
                            <button
                                type="button"
                                className="direct-input-toggle-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const input = document.querySelector('input[name="game"]');
                                    if (input) {
                                        input.readOnly = false;
                                        input.focus();
                                        input.placeholder = "경기명을 직접 입력하세요 (예: LG vs KIA)";
                                    }
                                }}
                                style={{ marginTop: '8px', fontSize: '12px', color: teamColors.bgColor, cursor: 'pointer' }}
                            >
                                직접 입력하기
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Date*</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Location*</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onClick={() => setShowLocationModal(true)}
                                placeholder="경기장을 선택해주세요"
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label>Seat*</label>
                            <input
                                type="text"
                                name="seat"
                                value={formData.seat}
                                onChange={handleChange}
                                placeholder="예시: A구역 4행 1열"
                            />
                        </div>

                        <div className="form-group">
                            <label>Comment*</label>
                            <input
                                type="text"
                                name="comment"
                                value={formData.comment}
                                onChange={handleChange}
                                placeholder="직관한 경기 한줄평을 남겨주세요."
                            />
                        </div>

                        <button className="next-btn" onClick={nextStep} style={{ backgroundColor: teamColors.bgColor }}>
                            다음
                        </button>
                    </div>
                )}

                {/* 2단계: 사진선택 */}
                {currentStep === 2 && (
                    <div className="form-step">
                        <div className="photo-upload-section">
                            <div className="photo-preview" style={{ position: 'relative' }}>
                                {ticketBackground && (
                                    <img
                                        src={ticketBackground}
                                        alt="티켓 배경"
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            opacity: 0.3,
                                            pointerEvents: 'none'
                                        }}
                                    />
                                )}
                                {formData.photoPreview ? (
                                    <img src={formData.photoPreview} alt="미리보기" style={{ position: 'relative', zIndex: 1 }} />
                                ) : (
                                    <div className="photo-placeholder" style={{ position: 'relative', zIndex: 1 }}>
                                        <div className="photo-icon">📷</div>
                                        <p>사진 선택</p>
                                        {selectedTeam && <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>{selectedTeam} 티켓</p>}
                                    </div>
                                )}
                            </div>
                            <p className="photo-guide">필수값(*)을 채워 관람한 경기를 티켓으로 완성하세요.</p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                style={{ display: 'none' }}
                                id="photo-input"
                            />
                            <label htmlFor="photo-input" className="photo-upload-btn" style={{ backgroundColor: teamColors.bgColor }}>
                                사진 선택
                            </label>
                        </div>

                        <div className="form-buttons">
                            <button className="prev-btn" onClick={prevStep}>이전</button>
                            <button className="next-btn" onClick={nextStep} style={{ backgroundColor: teamColors.bgColor }}>다음</button>
                        </div>
                    </div>
                )}

                {/* 3단계: 필수정보 */}
                {currentStep === 3 && (
                    <div className="form-step">
                        <div className="form-group">
                            <label>Type</label>
                            <input
                                type="text"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                placeholder="관람한 종목을 선택해주세요."
                            />
                        </div>

                        <div className="form-group">
                            <label>Score</label>
                            <div className="score-inputs">
                                <input
                                    type="number"
                                    name="awayScore"
                                    value={formData.awayScore}
                                    onChange={handleChange}
                                    placeholder="Away"
                                />
                                <span>:</span>
                                <input
                                    type="number"
                                    name="homeScore"
                                    value={formData.homeScore}
                                    onChange={handleChange}
                                    placeholder="Home"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Review</label>
                            <textarea
                                name="review"
                                value={formData.review}
                                onChange={handleChange}
                                rows={6}
                                placeholder="상세 리뷰를 작성해주세요..."
                            />
                        </div>

                        <div className="form-buttons">
                            <button className="prev-btn" onClick={prevStep}>이전</button>
                            <button className="submit-btn" onClick={handleSubmit} style={{ backgroundColor: teamColors.bgColor }}>
                                티켓 발급하기
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 경기 선택 모달 */}
            {showMatchModal && (
                <div className="location-modal" onClick={() => setShowMatchModal(false)}>
                    <div className="location-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowMatchModal(false)}>✕</button>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700 }}>KBO 경기 선택</h3>
                        {loadingMatches ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                경기 목록을 불러오는 중...
                            </div>
                        ) : matches.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                조회된 경기가 없습니다.
                            </div>
                        ) : (
                            <div className="stadium-list">
                                {matches.map(match => (
                                    <div
                                        key={match.matchcode}
                                        className="stadium-item match-item"
                                        onClick={() => handleMatchSelect(match)}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
                                                {match.away} vs {match.home}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                {match.matchdate} • {match.place}
                                            </div>
                                            {(match.awayScore !== null && match.homeScore !== null) && (
                                                <div style={{ fontSize: '13px', color: teamColors.bgColor, marginTop: '4px', fontWeight: 600 }}>
                                                    스코어: {match.awayScore} : {match.homeScore}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 팀 선택 모달 */}
            {showTeamModal && (
                <div className="location-modal" onClick={() => setShowTeamModal(false)}>
                    <div className="location-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowTeamModal(false)}>✕</button>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700 }}>응원 팀 선택</h3>
                        <div className="stadium-list">
                            {Object.keys(TEAM_COLORS).map(team => (
                                <div
                                    key={team}
                                    className="stadium-item team-item"
                                    onClick={() => {
                                        setSelectedTeam(team);
                                        localStorage.setItem('team', team);
                                        setShowTeamModal(false);
                                    }}
                                    style={{
                                        borderLeft: `4px solid ${TEAM_COLORS[team].bgColor}`,
                                        backgroundColor: selectedTeam === team ? `${TEAM_COLORS[team].bgColor}15` : 'transparent'
                                    }}
                                >
                                    <span style={{ fontSize: '20px', marginRight: '12px' }}>⚾</span>
                                    <span style={{ flex: 1, fontWeight: selectedTeam === team ? 700 : 400 }}>{team}</span>
                                    {selectedTeam === team && <span style={{ color: TEAM_COLORS[team].bgColor, fontWeight: 700 }}>✓</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 경기장 선택 모달 */}
            {showLocationModal && (
                <div className="location-modal" onClick={() => setShowLocationModal(false)}>
                    <div className="location-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowLocationModal(false)}>✕</button>
                        <input
                            type="text"
                            placeholder="경기장 이름 검색"
                            className="location-search"
                        />
                        <div className="stadium-list">
                            {stadiums.map(stadium => (
                                <div
                                    key={stadium}
                                    className="stadium-item"
                                    onClick={() => handleLocationSelect(stadium)}
                                >
                                    <span className="location-icon">📍</span>
                                    {stadium}
                                </div>
                            ))}
                        </div>
                        <button
                            className="direct-input-btn"
                            onClick={() => {
                                const custom = prompt('경기장 이름을 직접 입력하세요:');
                                if (custom) handleLocationSelect(custom);
                            }}
                        >
                            직접 입력
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketCreatePage;
