import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import imageCompression from 'browser-image-compression';
import { getTeamColors, TEAM_COLORS } from '../../sns/utils/teamColors';
import { TEAM_LOGOS } from '../../utils/teamLogos';
import { createTicket } from '../api/ticketApi';
import { getRecentMatches, getMatchesByDate } from '../api/matchApi';
import { normalizeStadiumName, KBO_STADIUMS } from '../utils/stadiumMapper';
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
    const team = localStorage.getItem('team');

    // 팀이 없거나 유효하지 않은 경우 (미정, 빈 문자열 등) null로 처리
    const isValidTeam = team && team !== '미정' && TEAM_COLORS[team];
    const validTeam = isValidTeam ? team : null;

    const [selectedTeam, setSelectedTeam] = useState(validTeam);
    const [teamColors, setTeamColors] = useState(selectedTeam ? TEAM_COLORS[selectedTeam] : { bgColor: '#4CAF50', textColor: '#ffffff' });
    const [ticketBackground, setTicketBackground] = useState(selectedTeam ? TICKET_BACKGROUNDS[selectedTeam] : null);
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
        myTeam: '',  // 내 응원팀
        result: '',  // 승리/패배
    });
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [matches, setMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null); // 선택된 경기 정보
    const [isSubmitting, setIsSubmitting] = useState(false); // 티켓 발급 중 상태

    // KBO 구장 목록 (stadiumMapper에서 가져옴)
    const stadiums = KBO_STADIUMS;

    // 팀이 없거나 유효하지 않으면 즉시 리다이렉트
    useEffect(() => {
        if (!validTeam) {
            alert('티켓을 발급하려면 먼저 마이페이지에서 좋아하는 팀을 선택해주세요.');
            navigate('/mypage', { replace: true });
        }
    }, [validTeam, navigate]);

    // 모달 열렸을 때 body 스크롤 비활성화
    useEffect(() => {
        if (showMatchModal || showLocationModal || showTeamModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // cleanup: 컴포넌트 언마운트 시 스크롤 복구
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showMatchModal, showLocationModal, showTeamModal]);

    // 팀 변경 시 색상과 배경 업데이트
    useEffect(() => {
        if (selectedTeam) {
            setTeamColors(TEAM_COLORS[selectedTeam] || { bgColor: '#4CAF50', textColor: '#ffffff' });
            setTicketBackground(TICKET_BACKGROUNDS[selectedTeam] || null);
        }
    }, [selectedTeam]);

    // 팀 변경 시 경기 결과 재계산
    useEffect(() => {
        if (selectedMatch && selectedTeam && formData.awayScore !== '' && formData.homeScore !== '') {
            let myTeam = '';
            let result = '';

            const homeWin = formData.homeScore > formData.awayScore;
            const awayWin = formData.awayScore > formData.homeScore;

            if (selectedMatch.home.includes(selectedTeam.split(' ')[0]) || selectedTeam.includes(selectedMatch.home)) {
                myTeam = selectedMatch.home;
                result = homeWin ? '승리' : (awayWin ? '패배' : '무승부');
            } else if (selectedMatch.away.includes(selectedTeam.split(' ')[0]) || selectedTeam.includes(selectedMatch.away)) {
                myTeam = selectedMatch.away;
                result = awayWin ? '승리' : (homeWin ? '패배' : '무승부');
            }

            setFormData(prev => ({
                ...prev,
                myTeam: myTeam,
                result: result
            }));
        }
    }, [selectedTeam, selectedMatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 실제 이미지 파일인지 검증하는 함수
    const validateImageFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const arr = new Uint8Array(reader.result).subarray(0, 4);
                let header = '';
                for (let i = 0; i < arr.length; i++) {
                    header += arr[i].toString(16);
                }

                // 이미지 파일 시그니처 확인
                const isValidImage =
                    header.startsWith('89504e47') || // PNG
                    header.startsWith('ffd8ff') ||   // JPEG
                    header.startsWith('47494638') || // GIF
                    header.startsWith('424d') ||     // BMP
                    header.startsWith('49492a00') || // TIFF
                    header.startsWith('4d4d002a');   // TIFF

                resolve(isValidImage);
            };
            reader.onerror = () => resolve(false);
            reader.readAsArrayBuffer(file.slice(0, 4));
        });
    };

    const compressImage = async (file) => {
        const options = {
            maxSizeMB: 1, // 최대 1MB
            maxWidthOrHeight: 1920, // 최대 1920px
            useWebWorker: true, // 성능 향상
        };

        try {
            const originalSize = (file.size / 1024 / 1024).toFixed(2);
            console.log('[TicketCreate] 이미지 압축 시작:', {
                fileName: file.name,
                originalSize: `${originalSize}MB`,
                type: file.type
            });

            const compressedFile = await imageCompression(file, options);
            const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);

            console.log('[TicketCreate] 이미지 압축 완료:', {
                fileName: file.name,
                originalSize: `${originalSize}MB`,
                compressedSize: `${compressedSize}MB`,
                compressionRatio: `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`
            });

            return new File([compressedFile], file.name, { type: compressedFile.type });
        } catch (error) {
            console.error('[TicketCreate] 이미지 압축 실패:', error);
            return file; // 압축 실패 시 원본 사용
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드 가능합니다.');
            return;
        }

        // 실제 이미지 파일인지 검증
        const isValidImage = await validateImageFile(file);
        if (!isValidImage) {
            alert('유효하지 않은 이미지 파일입니다.');
            return;
        }

        try {
            // 이미지 압축
            const compressedFile = await compressImage(file);

            // 압축 후에도 10MB 초과 시 차단
            if (compressedFile.size > 10 * 1024 * 1024) {
                alert('파일 크기는 10MB 이하만 가능합니다.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    photo: compressedFile,
                    photoPreview: reader.result
                }));
            };
            reader.readAsDataURL(compressedFile);
        } catch (error) {
            console.error('[TicketCreate] 이미지 처리 실패:', error);
            alert('이미지 처리 중 오류가 발생했습니다.');
        }
    };

    const handleLocationSelect = (stadium) => {
        setFormData(prev => ({
            ...prev,
            location: stadium
        }));
        setShowLocationModal(false);
    };

    const loadMatches = async (selectedDate) => {
        if (!selectedDate) {
            alert('먼저 날짜를 선택해주세요.');
            return;
        }

        setLoadingMatches(true);
        try {
            const response = await getMatchesByDate(selectedDate);
            console.log('경기 목록 응답:', response);
            // response가 배열이면 그대로, 아니면 response.data 사용
            const matchList = Array.isArray(response) ? response : (response.data || []);
            setMatches(matchList);
            console.log('설정된 경기 수:', matchList.length);
        } catch (error) {
            console.error('경기 목록 불러오기 실패:', error);
            setMatches([]);
        } finally {
            setLoadingMatches(false);
        }
    };

    const handleMatchModalOpen = () => {
        if (!formData.date) {
            alert('먼저 날짜를 선택해주세요.');
            return;
        }
        setShowMatchModal(true);
        loadMatches(formData.date);
    };

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        // 날짜 변경 시 이후 모든 입력값 리셋
        setFormData(prev => ({
            ...prev,
            date: newDate,
            matchcode: '',
            game: '',
            location: '',
            seat: '',
            comment: '',
            awayScore: '',
            homeScore: '',
            review: '',
            photo: null,
            photoPreview: null,
            myTeam: '',
            result: ''
        }));
        // 날짜가 변경되면 경기 목록과 선택된 경기 초기화
        setMatches([]);
        setSelectedMatch(null);
    };

    const handleMatchSelect = (match) => {
        // 선택된 경기 정보 저장
        setSelectedMatch(match);

        // 내 응원팀과 승패 판단
        let myTeam = '';
        let result = '';

        if (match.homeScore !== null && match.awayScore !== null) {
            // 점수가 있는 경우 승패 판단
            const homeWin = match.homeScore > match.awayScore;
            const awayWin = match.awayScore > match.homeScore;

            // 내가 응원하는 팀 찾기 (localStorage의 team)
            const supportTeam = selectedTeam;

            if (supportTeam) {
                if (match.home.includes(supportTeam.split(' ')[0]) || supportTeam.includes(match.home)) {
                    myTeam = match.home;
                    result = homeWin ? '승리' : (awayWin ? '패배' : '무승부');
                } else if (match.away.includes(supportTeam.split(' ')[0]) || supportTeam.includes(match.away)) {
                    myTeam = match.away;
                    result = awayWin ? '승리' : (homeWin ? '패배' : '무승부');
                }
            }
        }

        // 구장명 정규화
        const normalizedPlace = match.place ? normalizeStadiumName(match.place) : '';

        setFormData(prev => ({
            ...prev,
            matchcode: match.matchcode,
            game: `${match.away} vs ${match.home}`,
            date: match.matchdate,
            location: normalizedPlace,
            awayScore: match.awayScore !== null && match.awayScore !== undefined ? match.awayScore : '',
            homeScore: match.homeScore !== null && match.homeScore !== undefined ? match.homeScore : '',
            type: '야구',
            myTeam: myTeam,
            result: result
        }));
        setShowMatchModal(false);
    };

    const handleSubmit = async () => {
        // 이미 발급 중이면 무시
        if (isSubmitting) {
            return;
        }

        // 필수 항목 검증
        if (!formData.game || !formData.date || !formData.location || !formData.seat || !formData.comment) {
            alert('모든 필수 항목을 입력해주세요.');
            return;
        }
        if (!formData.photoPreview) {
            alert('사진을 선택해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            // team 필드 추가
            const ticketDataWithTeam = {
                ...formData,
                team: selectedTeam
            };
            await createTicket(ticketDataWithTeam);
            alert('티켓이 발급되었습니다!');
            navigate('/ticket/list');
        } catch (error) {
            console.error('티켓 발급 실패:', error);
            alert('티켓 발급에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 팀이 없거나 유효하지 않으면 아무것도 렌더링하지 않음
    if (!validTeam) {
        return null;
    }

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
                    style={{
                        color: teamColors.textColor,
                        borderBottom: `3px solid ${teamColors.textColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                    title="팀 변경"
                >
                    {selectedTeam && TEAM_LOGOS[selectedTeam] && (
                        <img
                            src={TEAM_LOGOS[selectedTeam]}
                            alt={selectedTeam}
                            style={{
                                width: '20px',
                                height: '20px',
                                objectFit: 'contain'
                            }}
                        />
                    )}
                    {selectedTeam ? selectedTeam.split(' ')[0] : '팀선택'}
                </button>
            </div>

            {/* 팀 선택 안내 */}
            <div className="team-info-banner" style={{
                backgroundColor: `${teamColors.bgColor}15`,
                borderLeft: `4px solid ${teamColors.bgColor}`
            }}>
                <span style={{ fontSize: '16px', marginRight: '8px' }}>⚾</span>
                <span style={{ fontSize: '13px', color: '#666' }}>
                    우측 상단에서 <strong style={{ color: teamColors.bgColor }}>팀을 선택</strong>하면 해당 팀 디자인의 티켓으로 발급됩니다
                </span>
            </div>

            {/* 통합 폼 */}
            <div className="ticket-form-container">
                <div className="form-step">
                        <div className="form-group">
                            <label>Date*</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleDateChange}
                            />
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                날짜를 먼저 선택하면 해당 날짜의 경기를 조회할 수 있습니다.
                            </p>
                        </div>

                        <div className="form-group">
                            <label>Game*</label>
                            <input
                                type="text"
                                name="game"
                                value={formData.game}
                                onChange={handleChange}
                                onClick={handleMatchModalOpen}
                                placeholder={formData.date ? "날짜의 KBO 경기를 선택하세요" : "먼저 날짜를 선택해주세요"}
                                readOnly
                                style={{
                                    backgroundColor: selectedMatch ? '#f3f4f6' : 'white',
                                    cursor: 'pointer'
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label>Location*</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onClick={() => !selectedMatch && setShowLocationModal(true)}
                                placeholder="경기장을 선택해주세요"
                                readOnly
                                style={{
                                    backgroundColor: selectedMatch ? '#f3f4f6' : 'white',
                                    cursor: selectedMatch ? 'not-allowed' : 'pointer'
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label>Seat* ({formData.seat.length}/10)</label>
                            <input
                                type="text"
                                name="seat"
                                value={formData.seat}
                                onChange={handleChange}
                                placeholder="예시: A구역 4행"
                                maxLength={10}
                            />
                        </div>

                        <div className="form-group">
                            <label>Comment* ({formData.comment.length}/15)</label>
                            <input
                                type="text"
                                name="comment"
                                value={formData.comment}
                                onChange={handleChange}
                                placeholder="한줄평 (15자)"
                                maxLength={15}
                            />
                        </div>

                        {/* 사진 업로드 */}
                        <div className="form-group">
                            <label>Photo*</label>
                            <label htmlFor="photo-input" className="photo-preview-inline" style={{ position: 'relative', cursor: 'pointer' }}>
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
                                    </div>
                                )}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                style={{ display: 'none' }}
                                id="photo-input"
                            />
                        </div>

                        {/* 추가 정보 */}
                        <div className="form-group">
                            <label>Score</label>
                            <div className="score-inputs">
                                <input
                                    type="number"
                                    name="awayScore"
                                    value={formData.awayScore}
                                    onChange={handleChange}
                                    placeholder="Away"
                                    readOnly={!!selectedMatch}
                                    style={{
                                        backgroundColor: selectedMatch ? '#f3f4f6' : 'white',
                                        cursor: selectedMatch ? 'not-allowed' : 'text'
                                    }}
                                />
                                <span>:</span>
                                <input
                                    type="number"
                                    name="homeScore"
                                    value={formData.homeScore}
                                    onChange={handleChange}
                                    placeholder="Home"
                                    readOnly={!!selectedMatch}
                                    style={{
                                        backgroundColor: selectedMatch ? '#f3f4f6' : 'white',
                                        cursor: selectedMatch ? 'not-allowed' : 'text'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Review ({formData.review.length}/50)</label>
                            <textarea
                                name="review"
                                value={formData.review}
                                onChange={handleChange}
                                rows={3}
                                placeholder="간단한 리뷰 (50자)"
                                maxLength={50}
                            />
                        </div>

                        {/* 승패 결과 표시 */}
                        {formData.result && (
                            <div className="result-display" style={{
                                marginTop: '16px',
                                padding: '12px 0',
                                textAlign: 'left'
                            }}>
                                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                                    {formData.myTeam}
                                </div>
                                <div style={{
                                    fontSize: '20px',
                                    fontWeight: 700,
                                    color: formData.result === '승리' ? '#4caf50' : (formData.result === '패배' ? '#f44336' : '#ff9800')
                                }}>
                                    {formData.result}
                                </div>
                            </div>
                        )}

                        {/* 오늘의 경기 결과 요약 */}
                        {matches.length > 0 && (
                            <div className="match-results-summary" style={{
                                marginTop: '20px',
                                marginBottom: '32px',
                                padding: '16px',
                                borderRadius: '8px',
                                backgroundColor: '#f5f5f5'
                            }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 700, color: '#333' }}>
                                    {formData.date} 경기 결과
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {matches.map(match => (
                                        <div key={match.matchcode} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px 12px',
                                            backgroundColor: '#fff',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            opacity: match.matchStatus === '취소' ? 0.6 : 1
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                {match.away} vs {match.home}
                                            </div>
                                            {match.matchStatus === '취소' ? (
                                                <div style={{
                                                    color: '#f44336',
                                                    fontSize: '12px',
                                                    fontWeight: 600
                                                }}>
                                                    경기 취소
                                                </div>
                                            ) : (match.awayScore !== null && match.homeScore !== null) ? (
                                                <div style={{
                                                    fontWeight: 700,
                                                    color: teamColors.bgColor,
                                                    minWidth: '60px',
                                                    textAlign: 'right'
                                                }}>
                                                    {match.awayScore} : {match.homeScore}
                                                </div>
                                            ) : (
                                                <div style={{ color: '#999', fontSize: '12px' }}>
                                                    취소된 경기
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            className="submit-btn"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            style={{
                                backgroundColor: isSubmitting ? '#ccc' : teamColors.bgColor,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                opacity: isSubmitting ? 0.6 : 1
                            }}
                        >
                            {isSubmitting ? '발급 중...' : '티켓 발급하기'}
                        </button>
                    </div>
            </div>

            {/* 경기 선택 모달 */}
            {showMatchModal && createPortal(
                <div 
                    className="location-modal" 
                    onClick={() => setShowMatchModal(false)}
                    style={{ 
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100vw',
                        height: '100vh',
                        margin: 0,
                        padding: 0
                    }}
                >
                    <div className="location-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowMatchModal(false)}>✕</button>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700 }}>KBO 경기 선택</h3>
                        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#666' }}>
                            {formData.date} 경기 목록
                        </p>
                        {loadingMatches ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                경기 목록을 불러오는 중...
                            </div>
                        ) : matches.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                <p style={{ marginBottom: '8px' }}>해당 날짜에 조회된 경기가 없습니다.</p>
                                <p style={{ fontSize: '12px', color: '#aaa' }}>
                                    다른 날짜를 선택하거나<br/>
                                    경기 정보를 직접 입력해주세요.
                                </p>
                            </div>
                        ) : (
                            <div className="stadium-list">
                                {matches.map(match => (
                                    <div
                                        key={match.matchcode}
                                        className="stadium-item match-item"
                                        onClick={() => handleMatchSelect(match)}
                                        style={{
                                            opacity: match.matchStatus === '취소' ? 0.6 : 1
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
                                                {match.away} vs {match.home}
                                                {match.matchStatus === '취소' && (
                                                    <span style={{
                                                        marginLeft: '8px',
                                                        fontSize: '12px',
                                                        color: '#f44336',
                                                        fontWeight: 600,
                                                        padding: '2px 6px',
                                                        backgroundColor: '#ffebee',
                                                        borderRadius: '4px'
                                                    }}>
                                                        취소됨
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                {match.matchdate} • {match.place}
                                            </div>
                                            {match.matchStatus !== '취소' && (match.awayScore !== null && match.homeScore !== null) && (
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
                </div>,
                document.body
            )}

            {/* 팀 선택 모달 */}
            {showTeamModal && (
                <div 
                    className="location-modal" 
                    onClick={() => setShowTeamModal(false)}
                    style={{ 
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100vw',
                        height: '100vh',
                        margin: 0,
                        padding: 0
                    }}
                >
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
                                        // 티켓 발급에서는 일시적으로만 팀 선택 (localStorage 업데이트 안함)
                                        setShowTeamModal(false);
                                    }}
                                    style={{
                                        borderLeft: `4px solid ${TEAM_COLORS[team].bgColor}`,
                                        backgroundColor: selectedTeam === team ? `${TEAM_COLORS[team].bgColor}15` : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    <img
                                        src={TEAM_LOGOS[team]}
                                        alt={team}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                    <span style={{ flex: 1, fontWeight: selectedTeam === team ? 700 : 400 }}>{team}</span>
                                    {selectedTeam === team && <span style={{ color: TEAM_COLORS[team].bgColor, fontWeight: 700 }}>✓</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* 경기장 선택 모달 */}
            {showLocationModal && createPortal(
                <div 
                    className="location-modal" 
                    onClick={() => setShowLocationModal(false)}
                    style={{ 
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100vw',
                        height: '100vh',
                        margin: 0,
                        padding: 0
                    }}
                >
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
                </div>,
                document.body
            )}
        </div>
    );
};

export default TicketCreatePage;
