package com.ssafy.yammy.match.util;

import java.util.HashMap;
import java.util.Map;

public class TeamNameMapper {

    // 약자 -> 풀네임 매핑
    private static final Map<String, String> CODE_TO_FULL_NAME = new HashMap<>();

    // 풀네임 -> 약자 매핑
    private static final Map<String, String> FULL_NAME_TO_CODE = new HashMap<>();

    static {
        // 현재 10개 구단
        FULL_NAME_TO_CODE.put("OB", "OB");
        FULL_NAME_TO_CODE.put("삼성", "SS");
        FULL_NAME_TO_CODE.put("MBC", "LG");
        FULL_NAME_TO_CODE.put("해태", "HT");
        FULL_NAME_TO_CODE.put("롯데", "LT");
        FULL_NAME_TO_CODE.put("삼미", "HD");
        FULL_NAME_TO_CODE.put("청보", "HD");
        FULL_NAME_TO_CODE.put("빙그레", "HH");
        FULL_NAME_TO_CODE.put("태평양", "HD");
        FULL_NAME_TO_CODE.put("LG", "LG");
        FULL_NAME_TO_CODE.put("쌍방울", "SB");
        FULL_NAME_TO_CODE.put("한화", "HH");
        FULL_NAME_TO_CODE.put("현대", "HD");
        FULL_NAME_TO_CODE.put("두산", "OB");
        FULL_NAME_TO_CODE.put("SK", "SK");
        FULL_NAME_TO_CODE.put("KIA", "HT");
        FULL_NAME_TO_CODE.put("우리", "WO");
        FULL_NAME_TO_CODE.put("넥센", "WO");
        FULL_NAME_TO_CODE.put("NC", "NC");
        FULL_NAME_TO_CODE.put("KT", "KT");
        FULL_NAME_TO_CODE.put("키움", "WO");
        FULL_NAME_TO_CODE.put("SSG", "SK");

        // 역방향 매핑 생성 (약자 -> 현재 풀네임)
        CODE_TO_FULL_NAME.put("OB", "두산");
        CODE_TO_FULL_NAME.put("SS", "삼성");
        CODE_TO_FULL_NAME.put("LG", "LG");
        CODE_TO_FULL_NAME.put("HT", "KIA");
        CODE_TO_FULL_NAME.put("LT", "롯데");
        CODE_TO_FULL_NAME.put("HD", "한화");
        CODE_TO_FULL_NAME.put("HH", "한화");
        CODE_TO_FULL_NAME.put("SK", "SSG");
        CODE_TO_FULL_NAME.put("WO", "키움");
        CODE_TO_FULL_NAME.put("NC", "NC");
        CODE_TO_FULL_NAME.put("KT", "KT");
    }

    // 팀별 홈구장 매핑
    private static final Map<String, String> TEAM_TO_STADIUM = new HashMap<>();

    // 구장 약칭 -> 풀네임 매핑
    private static final Map<String, String> STADIUM_SHORT_TO_FULL = new HashMap<>();

    static {
        TEAM_TO_STADIUM.put("롯데", "부산 사직 야구장");
        TEAM_TO_STADIUM.put("NC", "창원NC파크");
        TEAM_TO_STADIUM.put("SSG", "인천SSG랜더스필드");
        TEAM_TO_STADIUM.put("삼성", "대구삼성라이온즈파크");
        TEAM_TO_STADIUM.put("두산", "서울종합운동장 야구장(잠실)");
        TEAM_TO_STADIUM.put("LG", "서울종합운동장 야구장(잠실)");
        TEAM_TO_STADIUM.put("키움", "고척스카이돔");
        TEAM_TO_STADIUM.put("한화", "대전 한화생명 이글스파크");
        TEAM_TO_STADIUM.put("KIA", "광주기아챔피언스필드");
        TEAM_TO_STADIUM.put("KT", "수원KT위즈파크");

        // 구장 약칭 매핑
        STADIUM_SHORT_TO_FULL.put("사직", "부산 사직 야구장");
        STADIUM_SHORT_TO_FULL.put("부산", "부산 사직 야구장");
        STADIUM_SHORT_TO_FULL.put("창원", "창원NC파크");
        STADIUM_SHORT_TO_FULL.put("마산", "창원NC파크");
        STADIUM_SHORT_TO_FULL.put("인천", "인천SSG랜더스필드");
        STADIUM_SHORT_TO_FULL.put("문학", "인천SSG랜더스필드");
        STADIUM_SHORT_TO_FULL.put("대구", "대구삼성라이온즈파크");
        STADIUM_SHORT_TO_FULL.put("잠실", "서울종합운동장 야구장(잠실)");
        STADIUM_SHORT_TO_FULL.put("서울", "서울종합운동장 야구장(잠실)");
        STADIUM_SHORT_TO_FULL.put("고척", "고척스카이돔");
        STADIUM_SHORT_TO_FULL.put("대전", "대전 한화생명 이글스파크");
        STADIUM_SHORT_TO_FULL.put("광주", "광주기아챔피언스필드");
        STADIUM_SHORT_TO_FULL.put("수원", "수원KT위즈파크");
    }

    /**
     * 약자를 풀네임으로 변환
     */
    public static String codeToFullName(String code) {
        return CODE_TO_FULL_NAME.getOrDefault(code, code);
    }

    /**
     * 풀네임을 약자로 변환
     */
    public static String fullNameToCode(String fullName) {
        return FULL_NAME_TO_CODE.getOrDefault(fullName, fullName);
    }

    /**
     * 팀명으로 홈구장 조회
     */
    public static String getHomeStadium(String teamName) {
        return TEAM_TO_STADIUM.getOrDefault(teamName, "");
    }

    /**
     * 구장 약칭을 풀네임으로 변환
     */
    public static String normalizeStadiumName(String stadiumName) {
        if (stadiumName == null || stadiumName.isEmpty()) {
            return "";
        }

        // 이미 풀네임이면 그대로 반환
        if (TEAM_TO_STADIUM.containsValue(stadiumName)) {
            return stadiumName;
        }

        // 약칭으로 매핑 시도
        for (Map.Entry<String, String> entry : STADIUM_SHORT_TO_FULL.entrySet()) {
            if (stadiumName.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        return stadiumName;
    }
}
