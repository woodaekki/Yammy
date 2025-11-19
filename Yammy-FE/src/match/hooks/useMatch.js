import { useState, useCallback } from 'react';
import { getMatchesByDate, getMatchDetail } from '../api/matchApi';

export function useMatch() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 날짜별 경기 검색 (실제 FastAPI 호출)
   * @param {string} date - 날짜 (예: "20251031")
   */
  const searchMatchesByDate = useCallback(async (date) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getMatchesByDate(date);

      if (response.status === 'success') {
        setMatches(response.data || []);
      } else {
        throw new Error(response.message || '알 수 없는 오류가 발생했습니다');
      }

    } catch (err) {
      console.error('[useMatch] Match search error:', {
        date,
        error: err.message,
        code: err.code,
        status: err.response?.status,
        data: err.response?.data
      });

      let errorMessage = "해당 날짜의 경기 정보를 불러오는데 실패했습니다.";

      if (err.code === 'ECONNREFUSED') {
        errorMessage = "서버에 연결할 수 없습니다.";
      } else if (err.response?.status === 404) {
        errorMessage = "해당 날짜의 경기 데이터를 찾을 수 없습니다.";
      } else if (err.response?.status === 500) {
        errorMessage = "서버 내부 오류가 발생했습니다.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []); // 빈 의존성 배열로 함수 메모이제이션

  /**
   * 특정 matchcode의 상세 정보 조회
   * @param {string} matchcode - 경기코드
   * @returns {Promise} 경기 상세 정보
   */
  const getMatchDetailInfo = useCallback(async (matchcode) => {
    try {
      const response = await getMatchDetail(matchcode);

      if (response.status === 'success') {
        return response.data;
      } else {
        throw new Error(response.message || '경기 상세 정보를 찾을 수 없습니다');
      }

    } catch (err) {
      console.error('[useMatch] Match detail error:', {
        matchcode,
        error: err.message,
        code: err.code,
        status: err.response?.status,
        data: err.response?.data
      });

      let errorMessage = '경기 상세 정보를 불러오는데 실패했습니다.';

      if (err.code === 'ECONNREFUSED') {
        errorMessage = "서버에 연결할 수 없습니다.";
      } else if (err.response?.status === 404) {
        errorMessage = `'${matchcode}' 경기를 찾을 수 없습니다.`;
      } else if (err.message) {
        errorMessage = err.message;
      }

      throw new Error(errorMessage);
    }
  }, []); // 빈 의존성 배열로 함수 메모이제이션

  // 호환성을 위한 함수들
  const getMatchByMatchcode = useCallback(async (matchcode) => {
    return await getMatchDetailInfo(matchcode);
  }, [getMatchDetailInfo]);

  const getScoreboardByMatchcode = async (matchcode) => {
    const foundMatch = matches.find(match => match.matchcode === matchcode);
    return foundMatch || null;
  };

  const searchMatches = async (searchParams) => {
    if (searchParams?.date) {
      await searchMatchesByDate(searchParams.date);
    } else {
      setError('날짜 정보가 필요합니다.');
    }
  };

  const refreshMatches = async () => {
    // 특정 날짜 없이 새로고침은 지원되지 않음
  };

  return {
    // 상태
    matches,
    loading,
    error,
    
    // 주요 함수들
    searchMatchesByDate,
    getMatchDetail: getMatchDetailInfo,
    
    // 호환성 함수들
    getMatchByMatchcode,
    getScoreboardByMatchcode,
    searchMatches,
    refreshMatches,
    setMatches,
  };
}
