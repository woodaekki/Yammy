// 구단 로고 이미지 import (상대 경로로 다시 시도)
import kiaLogo from '../../assets/logo/kia.svg';
import ktLogo from '../../assets/logo/kt.svg';
import lgLogo from '../../assets/logo/lg.png';
import samsungLogo from '../../assets/logo/samsung.svg';
import ssgLogo from '../../assets/logo/ssg.svg';
import ncLogo from '../../assets/logo/nc.png';
import doosanLogo from '../../assets/logo/doosan.svg';
import kiwoomLogo from '../../assets/logo/kiwoom.svg';
import hanwhaLogo from '../../assets/logo/hanwha.svg';
import lotteLogo from '../../assets/logo/lotte.png';

// 팀명과 로고 매핑 객체
const TEAM_LOGOS = {
  'KIA': kiaLogo,
  'KT': ktLogo,
  'LG': lgLogo,
  '삼성': samsungLogo,
  'SSG': ssgLogo,
  'NC': ncLogo,
  '두산': doosanLogo,
  '키움': kiwoomLogo,
  '한화': hanwhaLogo,
  '롯데': lotteLogo,
}

/**
 * 팀명으로 로고 이미지 경로를 반환하는 함수
 * @param {string} teamName - 팀명 (예: "KIA", "삼성", "LG" 등)
 * @returns {string} 로고 이미지 경로
 */
export const getTeamLogo = (teamName) => {
  if (!teamName) return null;
  
  // 팀명을 대문자로 변환하여 매칭
  const upperTeamName = teamName.toUpperCase().trim();
  
  // 직접 매핑 확인
  if (TEAM_LOGOS[upperTeamName]) {
    return TEAM_LOGOS[upperTeamName];
  }
  
  // 부분 매칭 (팀명에 키워드가 포함된 경우)
  for (const [key, logo] of Object.entries(TEAM_LOGOS)) {
    if (upperTeamName.includes(key) || key.includes(upperTeamName)) {
      return logo;
    }
  }
  
  return null;
};

/**
 * 팀 로고 컴포넌트
 * @param {Object} props
 * @param {string} props.teamName - 팀명
 * @param {string} props.size - 크기 ('small', 'medium', 'large')
 * @param {string} props.className - 추가 CSS 클래스
 */
export const TeamLogo = ({ teamName, size = 'medium', className = '' }) => {
  const logoSrc = getTeamLogo(teamName);

  if (!logoSrc) {
    return (
      <div className={`team-logo-placeholder team-logo-${size} ${className}`}>
        {teamName?.charAt(0) || '?'}
      </div>
    );
  }

  return (
    <img
      src={logoSrc}
      alt={`${teamName} 로고`}
      className={`team-logo team-logo-${size} ${className}`}
      onError={(e) => {
        console.error('Team logo load error:', teamName);
        const placeholder = document.createElement('div');
        placeholder.className = `team-logo-placeholder team-logo-${size} ${className}`;
        placeholder.textContent = teamName?.charAt(0) || '?';
        e.target.parentNode.replaceChild(placeholder, e.target);
      }}
    />
  );
};

export default {
  getTeamLogo,
  TeamLogo,
  TEAM_LOGOS
};
