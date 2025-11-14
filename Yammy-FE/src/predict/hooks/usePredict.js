import { useState, useEffect } from 'react';
import { getTodayMatches, getMatchesByDate } from '../api/predictApi';
import { TEAM_COLORS } from '../../sns/utils/teamColors';

// 팀 이름 매핑 (공통 사용)
const teamNameMapping = {
  'KIA': 'KIA 타이거즈',
  '삼성': '삼성 라이온즈',
  'LG': 'LG 트윈스',
  '두산': '두산 베어스',
  'KT': 'KT 위즈',
  'SSG': 'SSG 랜더스',
  '롯데': '롯데 자이언츠',
  '한화': '한화 이글스',
  'NC': 'NC 다이노스',
  '키움': '키움 히어로즈'
};

// 팀 풀네임 가져오기 함수
export const getFullTeamName = (teamName) => {
  return teamNameMapping[teamName] || teamName;
};

// 팀 컬러 매핑 함수 (공통 사용)
export const getTeamColor = (teamName) => {
  const fullTeamName = teamNameMapping[teamName] || teamName;
  return TEAM_COLORS[fullTeamName]?.bgColor || '#4CAF50';
};

// 팀별 상대 전적 승률 데이터 (이 팀이 상대 팀을 이긴 승률)
const teamMatchupWinRates = {
  'LG': {
    '한화': 53.3,
    'SSG': 62.5,
    '삼성': 56.3,
    'NC': 50.0,
    'KT': 68.8,
    '롯데': 69.2,
    'KIA': 68.8,
    '두산': 56.3,
    '키움': 56.3
  },
  '한화': {
    'LG': 46.7,
    'SSG': 50.0,
    '삼성': 50.0,
    'NC': 60.0,
    'KT': 60.0,
    '롯데': 62.5,
    'KIA': 75.0,
    '두산': 40.0,
    '키움': 87.5
  },
  'SSG': {
    'LG': 46.7,
    '한화': 50.0,
    '삼성': 46.7,
    'NC': 60.0,
    'KT': 56.3,
    '롯데': 62.5,
    'KIA': 46.7,
    '두산': 62.5,
    '키움': 60.0
  },
  '삼성': {
    'LG': 43.8,
    '한화': 50.0,
    'SSG': 53.3,
    'NC': 56.3,
    'KT': 31.3,
    '롯데': 46.7,
    'KIA': 50.0,
    '두산': 62.5,
    '키움': 75.0
  },
  'NC': {
    'LG': 50.0,
    '한화': 40.0,
    'SSG': 40.0,
    '삼성': 43.8,
    'KT': 60.0,
    '롯데': 50.0,
    'KIA': 56.3,
    '두산': 64.3,
    '키움': 60.0
  },
  'KT': {
    'LG': 35.7,
    '한화': 40.0,
    'SSG': 43.8,
    '삼성': 66.7,
    'NC': 40.0,
    '롯데': 42.9,
    'KIA': 50.0,
    '두산': 73.3,
    '키움': 68.8
  },
  '롯데': {
    'LG': 28.6,
    '한화': 37.5,
    'SSG': 37.5,
    '삼성': 53.3,
    'NC': 50.0,
    'KT': 57.1,
    'KIA': 50.0,
    '두산': 46.7,
    '키움': 68.8
  },
  'KIA': {
    'LG': 31.2,
    '한화': 25.0,
    'SSG': 53.3,
    '삼성': 50.0,
    'NC': 43.8,
    'KT': 50.0,
    '롯데': 50.0,
    '두산': 60.0,
    '키움': 57.1
  },
  '두산': {
    'LG': 43.8,
    '한화': 60.0,
    'SSG': 37.5,
    '삼성': 37.5,
    'NC': 35.7,
    'KT': 26.7,
    '롯데': 53.3,
    'KIA': 40.0,
    '키움': 62.5
  },
  '키움': {
    'LG': 43.7,
    '한화': 12.5,
    'SSG': 40.0,
    '삼성': 25.0,
    'NC': 40.0,
    'KT': 31.2,
    '롯데': 31.2,
    'KIA': 42.9,
    '두산': 37.5
  }
};

// 승부예측 관련 커스텀 훅
export const usePredict = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 백엔드 데이터를 프론트엔드 형식으로 변환
  const transformMatchData = (backendMatch) => {
    // 팀별 홈구장 매핑
    const homeStadiums = {
      'KIA': 'KIA 챔피언스 필드',
      '삼성': '대구 삼성 라이온즈 파크',
      'LG': '잠실야구장',
      '두산': '잠실야구장',
      'KT': '수원 KT 위즈 파크',
      'SSG': '인천 SSG 랜더스필드',
      '롯데': '사직야구장',
      '한화': '한화생명 이글스파크',
      'NC': '창원 NC 파크',
      '키움': '고척 스카이돔'
    };

    // 기본 경기 시간 (주중: 18:30, 주말: 17:00)
    const getGameTime = () => {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0=일요일, 6=토요일
      return (dayOfWeek === 0 || dayOfWeek === 6) ? '17:00' : '18:30';
    };

    // 상대 전적 기반 승률 계산
    const homeTeam = backendMatch.home;
    const awayTeam = backendMatch.away;
    const homeWinningRate = teamMatchupWinRates[homeTeam]?.[awayTeam] || 50.0;
    const awayWinningRate = teamMatchupWinRates[awayTeam]?.[homeTeam] || 50.0;

    return {
      id: backendMatch.predictedMatchId || backendMatch.id,  // 🔥 정산용 ID (predicted_matches의 PK)
      matchScheduleId: backendMatch.id,  // match_schedule 테이블의 ID (참조용)
      homeTeam: homeTeam,
      awayTeam: awayTeam,
      gameTime: getGameTime(),
      stadium: homeStadiums[homeTeam] || `${homeTeam} 홈구장`,
      date: backendMatch.matchDate, // 🔥 필드명 수정: matchDate → date
      matchStatus: backendMatch.matchStatus,
      gameid: backendMatch.gameid,
      year: backendMatch.year,
      homeWinningRate: homeWinningRate, // 🔥 실제 상대 전적 기반 승률
      awayWinningRate: awayWinningRate, // 🔥 실제 상대 전적 기반 승률
      // 🔥 백엔드에서 받은 실제 배당률 사용
      homeOdds: backendMatch.homeOdds || 2.0, // 홈팀 배당률 (기본값 2.0)
      awayOdds: backendMatch.awayOdds || 2.0, // 원정팀 배당률 (기본값 2.0)
      // 🆕 백엔드에서 받은 배팅 금액 사용
      homeAmount: backendMatch.homeAmount || 1, // 홈팀 배팅 금액 (기본값 1)
      awayAmount: backendMatch.awayAmount || 1, // 원정팀 배팅 금액 (기본값 1)
      // 🆕 정산 여부 추가
      isSettled: backendMatch.isSettled || 0, // 정산 여부 (0: 미정산, 1: 정산 완료)
    };
  };

  // 오늘의 경기 데이터 가져오기 (백엔드 API 사용)
  const fetchTodayMatches = async () => {
    try {
      setLoading(true);
      
      const backendMatches = await getTodayMatches();
      const transformedMatches = backendMatches.map(transformMatchData);

      setMatches(transformedMatches);
      setError(null);
    } catch (err) {
      setError('경기 데이터를 불러오는데 실패했습니다.');
      console.error('Error fetching matches:', err.message);
      
      // 에러 발생 시 빈 배열로 설정
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  // 특정 날짜의 경기 데이터 가져오기
  const fetchMatchesByDate = async (date) => {
    try {
      setLoading(true);
      
      const backendMatches = await getMatchesByDate(date);
      const transformedMatches = backendMatches.map(transformMatchData);

      setMatches(transformedMatches);
      setError(null);
    } catch (err) {
      setError('경기 데이터를 불러오는데 실패했습니다.');
      console.error('Error fetching matches by date:', err.message);
      
      // 에러 발생 시 빈 배열로 설정
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 오늘 데이터 로드
  useEffect(() => {
    fetchTodayMatches();
  }, []);

  return {
    matches,
    loading,
    error,
    fetchTodayMatches,
    fetchMatchesByDate
  };
};
