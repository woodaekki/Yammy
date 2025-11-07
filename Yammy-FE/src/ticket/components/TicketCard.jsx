import { useState } from 'react';
import { getTeamColors } from '../../sns/utils/teamColors';
import { mintNFT, canMintNFT, getNFTStatusMessage, getEtherscanNFTUrl, getOpenSeaNFTUrl } from '../api/nftApi';
import '../styles/TicketCard.css';

const TicketCard = ({ ticket, onNftMinted }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [mintStatus, setMintStatus] = useState('');
    const teamColors = getTeamColors();

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleMintNFT = async (e) => {
        e.stopPropagation(); // 카드 플립 방지

        if (!canMintNFT(ticket)) {
            alert('NFT 발급이 불가능합니다.');
            return;
        }

        if (!confirm('이 티켓을 NFT로 발급하시겠습니까?\n\n메타마스크가 없어도 발급 가능합니다.\n발급된 NFT는 서비스 내에서 보관됩니다.')) {
            return;
        }

        setIsMinting(true);
        setMintStatus('NFT 발급 중...');

        try {
            // photo는 ticket.photoPreview가 있으면 fetch로 가져와야 하지만
            // 간단하게 하기 위해 일단 null로 처리 (이미 티켓에 사진이 저장되어 있음)
            const response = await mintNFT(ticket.ticketId, null, null);

            if (response.success) {
                setMintStatus('NFT 발급 완료!');
                alert(`NFT 발급이 완료되었습니다!\n\nToken ID: ${response.tokenId}\nTransaction: ${response.transactionHash}`);

                // 부모 컴포넌트에 알림 (티켓 목록 새로고침용)
                if (onNftMinted) {
                    onNftMinted(ticket.ticketId, response);
                }
            } else {
                setMintStatus('NFT 발급 실패');
                alert(`NFT 발급에 실패했습니다.\n\n오류: ${response.errorMessage || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('NFT 발급 오류:', error);
            setMintStatus('NFT 발급 실패');
            alert(`NFT 발급 중 오류가 발생했습니다.\n\n${error.response?.data?.message || error.message}`);
        } finally {
            setIsMinting(false);
            setTimeout(() => setMintStatus(''), 3000);
        }
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

                        {/* NFT 발급 버튼 */}
                        <div className="nft-section" onClick={(e) => e.stopPropagation()}>
                            {ticket.nftMinted ? (
                                <div className="nft-status">
                                    <span className="nft-badge">✅ NFT 발급 완료</span>
                                    {ticket.nftTokenId && (
                                        <div className="nft-links">
                                            <a
                                                href={getEtherscanNFTUrl(ticket.nftTokenId)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="nft-link"
                                            >
                                                Etherscan에서 보기
                                            </a>
                                            <a
                                                href={getOpenSeaNFTUrl(ticket.nftTokenId)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="nft-link"
                                            >
                                                OpenSea에서 보기
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="nft-mint-section">
                                    <button
                                        className="nft-mint-button"
                                        onClick={handleMintNFT}
                                        disabled={isMinting || !canMintNFT(ticket)}
                                    >
                                        {isMinting ? '🔄 발급 중...' : '🎫 NFT로 발급하기'}
                                    </button>
                                    {mintStatus && (
                                        <p className="mint-status">{mintStatus}</p>
                                    )}
                                    <p className="nft-info-text">
                                        메타마스크 없이도 발급 가능합니다
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketCard;
