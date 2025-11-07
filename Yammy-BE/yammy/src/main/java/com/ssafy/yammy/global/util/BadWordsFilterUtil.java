package com.ssafy.yammy.global.util;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Component
public class BadWordsFilterUtil {

    // 욕설 데이터 저장할 리스트
    private final List<String> bannedWords = new ArrayList<>();

    // 파일에서 욕설 단어 불러오기 함수 실행
    public BadWordsFilterUtil() {
        loadBadWords();
    }

    // 파일에서 욕설 단어 불러오기
    private void loadBadWords() {
        try {
            List<String> badWords = Files.readAllLines(Path.of("src/main/resources/badwords.txt"));

            for (String badWord : badWords) {
                String word = badWord.trim();
                bannedWords.add(word);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    // 문장 안에 욕설이 포함되어있는지 확인하기
    public boolean containsBadWord(String word) {
        if (word == null) return false;

        for (String badWord : bannedWords) {
            if (word.contains(word)) {
                return true;
            }
        }
        return false;
    }

    // 문장 안에 욕설을 *로 글자 수 만큼 바꾸기
    public String maskBadWords(String word) {
        if (word == null) return null;

        String result = word;

        for (String badWord : bannedWords) {
            if (result.contains(badWord)) {
                String stars = "*".repeat(badWord.length());
                result = result.replace(badWord, stars);
            }
        }
        return result;
    }
}
