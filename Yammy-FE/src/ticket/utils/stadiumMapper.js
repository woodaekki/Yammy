// 구장 약칭 -> 풀네임 매핑
const STADIUM_SHORT_TO_FULL = {
    '사직': '부산 사직 야구장',
    '부산': '부산 사직 야구장',
    '창원': '창원NC파크',
    '마산': '창원NC파크',
    '인천': '인천SSG랜더스필드',
    '문학': '인천SSG랜더스필드',
    '대구': '대구삼성라이온즈파크',
    '잠실': '서울종합운동장 야구장(잠실)',
    '서울': '서울종합운동장 야구장(잠실)',
    '고척': '고척스카이돔',
    '대전': '대전 한화생명 이글스파크',
    '광주': '광주기아챔피언스필드',
    '수원': '수원KT위즈파크',
};

// KBO 구장 풀네임 목록
export const KBO_STADIUMS = [
    '부산 사직 야구장',
    '창원NC파크',
    '인천SSG랜더스필드',
    '대구삼성라이온즈파크',
    '서울종합운동장 야구장(잠실)',
    '고척스카이돔',
    '대전 한화생명 이글스파크',
    '광주기아챔피언스필드',
    '수원KT위즈파크'
];

/**
 * 구장 약칭을 풀네임으로 변환
 */
export const normalizeStadiumName = (stadiumName) => {
    if (!stadiumName) {
        return '';
    }

    // 이미 풀네임이면 그대로 반환
    if (KBO_STADIUMS.includes(stadiumName)) {
        return stadiumName;
    }

    // 약칭으로 매핑 시도
    for (const [shortName, fullName] of Object.entries(STADIUM_SHORT_TO_FULL)) {
        if (stadiumName.includes(shortName)) {
            return fullName;
        }
    }

    return stadiumName;
};

export default {
    normalizeStadiumName,
    KBO_STADIUMS
};
