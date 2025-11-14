// 팀 로고 import
import lgLogo from '../assets/logo/lg.png';
import hanwhaLogo from '../assets/logo/hanwha.svg';
import ssgLogo from '../assets/logo/ssg.svg';
import samsungLogo from '../assets/logo/samsung.svg';
import ncLogo from '../assets/logo/nc.png';
import ktLogo from '../assets/logo/kt.svg';
import lotteLogo from '../assets/logo/lotte.png';
import kiaLogo from '../assets/logo/kia.svg';
import doosanLogo from '../assets/logo/doosan.svg';
import kiwoomLogo from '../assets/logo/kiwoom.svg';

// 팀 이름과 로고 매핑
export const TEAM_LOGOS = {
  'LG 트윈스': lgLogo,
  '한화 이글스': hanwhaLogo,
  'SSG 랜더스': ssgLogo,
  '삼성 라이온즈': samsungLogo,
  'NC 다이노스': ncLogo,
  'KT 위즈': ktLogo,
  '롯데 자이언츠': lotteLogo,
  'KIA 타이거즈': kiaLogo,
  '두산 베어스': doosanLogo,
  '키움 히어로즈': kiwoomLogo,
};

// 팀 로고 가져오기
export const getTeamLogo = (teamName) => {
  return TEAM_LOGOS[teamName] || null;
};
