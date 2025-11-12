import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * NFT 발급 API
 * @param {number} ticketId - 티켓 ID
 * @param {File|null} photo - 티켓 사진 (선택)
 * @param {string|null} walletAddress - 지갑 주소 (없으면 서비스 지갑으로 발급)
 * @returns {Promise} NFT 발급 결과
 */
export const mintNFT = async (ticketId, photo = null, walletAddress = null) => {
  try {
    const formData = new FormData();

    // request JSON
    const request = {
      ticketId: ticketId,
      walletAddress: walletAddress || '' // 빈 문자열이면 백엔드에서 서비스 지갑 사용
    };

    formData.append('request', new Blob([JSON.stringify(request)], {
      type: 'application/json'
    }));

    // photo (optional)
    if (photo) {
      console.log('Photo 파일 정보:', {
        name: photo.name,
        size: photo.size,
        type: photo.type
      });
      formData.append('photo', photo);
      console.log('FormData에 photo 추가 완료');
    } else {
      console.log('Photo가 null입니다.');
    }

    const token = localStorage.getItem('accessToken');

    const response = await axios.post(
      `${API_BASE_URL}/nft/mint`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('NFT 발급 실패:', error);
    throw error;
  }
};

/**
 * NFT 발급 가능 여부 확인
 * @param {Object} ticket - 티켓 객체
 * @returns {boolean} 발급 가능 여부
 */
export const canMintNFT = (ticket) => {
  if (!ticket) return false;

  // 이미 NFT가 발급되었으면 false
  if (ticket.nftMinted === true) return false;

  // id가 있어야 함 (백엔드에서 id로 전달)
  if (!ticket.id && !ticket.ticketId) return false;

  return true;
};

/**
 * NFT 상태 메시지 가져오기
 * @param {Object} ticket - 티켓 객체
 * @returns {string} 상태 메시지
 */
export const getNFTStatusMessage = (ticket) => {
  if (!ticket) return '';

  if (ticket.nftMinted === true) {
    return `NFT 발급 완료 (Token ID: ${ticket.nftTokenId || 'N/A'})`;
  }

  return 'NFT 미발급';
};

/**
 * Etherscan에서 NFT 보기
 * @param {number} tokenId - NFT 토큰 ID
 * @returns {string} Etherscan URL
 */
export const getEtherscanNFTUrl = (tokenId) => {
  const contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
  const etherscanUrl = import.meta.env.VITE_ETHERSCAN_URL || 'https://sepolia.etherscan.io';

  return `${etherscanUrl}/token/${contractAddress}?a=${tokenId}`;
};

/**
 * OpenSea에서 NFT 보기
 * @param {number} tokenId - NFT 토큰 ID
 * @returns {string} OpenSea URL
 */
export const getOpenSeaNFTUrl = (tokenId) => {
  const contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
  const openSeaUrl = import.meta.env.VITE_OPENSEA_URL || 'https://testnets.opensea.io';

  return `${openSeaUrl}/assets/sepolia/${contractAddress}/${tokenId}`;
};
