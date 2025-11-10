import { useState, useEffect } from 'react';

// 더미 경기 데이터 (5경기)
const DUMMY_MATCHES = [
  {
    id: 1,
    homeTeam: 'KIA 타이거즈',
    awayTeam: '삼성 라이온즈',
    gameTime: '23:30',
    stadium: '광주-기아 챔피언스 필드',
    date: '2025-11-09',
    homeWinningRate: 50,
    awayWinningRate: 50,
  },
  {
    id: 2,
    homeTeam: 'LG 트윈스',
    awayTeam: '두산 베어스',
    gameTime: '23:30',
    stadium: '잠실야구장',
    date: '2025-11-09',
    homeWinningRate: 50,
    awayWinningRate: 50,
  },
  {
    id: 3,
    homeTeam: 'KT 위즈',
    awayTeam: 'SSG 랜더스',
    gameTime: '23:30',
    stadium: '수원 KT 위즈 파크',
    date: '2025-11-09',
    homeWinningRate: 50,
    awayWinningRate: 50,
  },
  {
    id: 4,
    homeTeam: '롯데 자이언츠',
    awayTeam: '한화 이글스',
    gameTime: '18:30',
    stadium: '사직야구장',
    date: '2025-11-09',
    homeWinningRate: 50,
    awayWinningRate: 50,
  },
  {
    id: 5,
    homeTeam: 'NC 다이노스',
    awayTeam: '키움 히어로즈',
    gameTime: '18:30',
    stadium: '창원 NC 파크',
    date: '2025-11-09',
    homeWinningRate: 50,
    awayWinningRate: 50,
  }
];

// 승부예측 관련 커스텀 훅
export const usePredict = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 오늘의 경기 데이터 가져오기 (더미데이터 사용)
  const fetchTodayMatches = async () => {
    try {
      setLoading(true);
      
      // API 호출을 시뮬레이션하기 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMatches(DUMMY_MATCHES);
      setError(null);
    } catch (err) {
      setError('경기 데이터를 불러오는데 실패했습니다.');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchTodayMatches();
  }, []);

  return {
    matches,
    loading,
    error,
    fetchTodayMatches
  };
};
