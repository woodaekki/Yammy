import { useState, useEffect } from 'react';
import { getTodayMatches, getMatchesByDate } from '../api/predictApi';

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

    return {
      id: backendMatch.id,
      homeTeam: backendMatch.home,
      awayTeam: backendMatch.away,
      gameTime: getGameTime(),
      stadium: homeStadiums[backendMatch.home] || `${backendMatch.home} 홈구장`,
      date: backendMatch.matchDate,
      matchStatus: backendMatch.matchStatus,
      gameid: backendMatch.gameid,
      year: backendMatch.year,
      homeWinningRate: 50, // 기본값 - 추후 AI 예측 결과로 대체
      awayWinningRate: 50, // 기본값 - 추후 AI 예측 결과로 대체
    };
  };

  // 오늘의 경기 데이터 가져오기 (백엔드 API 사용)
  const fetchTodayMatches = async () => {
    try {
      setLoading(true);
      
      const backendMatches = await getTodayMatches();
      
      // 백엔드 데이터를 프론트엔드 형식으로 변환
      const transformedMatches = backendMatches.map(transformMatchData);
      
      setMatches(transformedMatches);
      setError(null);
      
      console.log('🎯 변환된 경기 데이터:', transformedMatches);
    } catch (err) {
      setError('경기 데이터를 불러오는데 실패했습니다.');
      console.error('Error fetching matches:', err);
      
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
      
      // 백엔드 데이터를 프론트엔드 형식으로 변환
      const transformedMatches = backendMatches.map(transformMatchData);
      
      setMatches(transformedMatches);
      setError(null);
      
      console.log(`🎯 ${date} 경기 데이터:`, transformedMatches);
    } catch (err) {
      setError('경기 데이터를 불러오는데 실패했습니다.');
      console.error('Error fetching matches:', err);
      
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
