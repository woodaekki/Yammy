// 팀별 컬러 매핑 (bgcolor1, textcolor1)
// 회원가입 시 전체 이름으로 저장되므로 전체 이름으로 매핑
const TEAM_COLORS = {
  '키움 히어로즈': { bgColor: '#570514', textColor: '#ffffff' },
  '두산 베어스': { bgColor: '#1A1748', textColor: '#ffffff' },
  '롯데 자이언츠': { bgColor: '#041E42', textColor: '#ffffff' },
  '삼성 라이온즈': { bgColor: '#074CA1', textColor: '#ffffff' },
  '한화 이글스': { bgColor: '#FC4E00', textColor: '#ffffff' },
  'KIA 타이거즈': { bgColor: '#EA0029', textColor: '#ffffff' },
  'LG 트윈스': { bgColor: '#C30452', textColor: '#ffffff' },
  'SSG 랜더스': { bgColor: '#CF0E20', textColor: '#ffffff' },
  'NC 다이노스': { bgColor: '#315288', textColor: '#ffffff' },
  'KT 위즈': { bgColor: '#000000', textColor: '#ffffff' }
};

const TEAM_COLORS_V2 = {
  '키움 히어로즈': { bgColor: '#6C1026', textColor: '#ffffff' },
  '두산 베어스': { bgColor: '#121230', textColor: '#ffffff' },
  '롯데 자이언츠': { bgColor: '#092C5A', textColor: '#ffffff' },
  '삼성 라이온즈': { bgColor: '#0172C4', textColor: '#ffffff' },
  '한화 이글스': { bgColor: '#ED7B3D', textColor: '#ffffff' },
  'KIA 타이거즈': { bgColor: '#A22625', textColor: '#ffffff' },
  'LG 트윈스': { bgColor: '#C63751', textColor: '#ffffff' },
  'SSG 랜더스': { bgColor: '#B42D4D', textColor: '#ffffff' },
  'NC 다이노스': { bgColor: '#1C467D', textColor: '#ffffff' },
  'KT 위즈': { bgColor: '#231F20', textColor: '#ffffff' }
}

// localStorage에서 팀 정보 가져오기
export const getUserTeam = () => {
  return localStorage.getItem('team') || null;
};

// 팀 컬러 가져오기 (기본값: 어두운 잔디색)
export const getTeamColors = (teamOverride = null) => {
  const team = teamOverride || getUserTeam();
  return TEAM_COLORS[team] || { bgColor: '#14452f', textColor: '#ffffff' };
};

// TEAM_COLORS export
export { TEAM_COLORS, TEAM_COLORS_V2 };
