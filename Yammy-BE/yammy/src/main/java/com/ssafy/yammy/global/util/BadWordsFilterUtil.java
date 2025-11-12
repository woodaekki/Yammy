package com.ssafy.yammy.global.util;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
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
        ClassPathResource resource = new ClassPathResource("badwords.txt");

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

            String badWord;
            while ((badWord = reader.readLine()) != null) {
                String word = badWord.trim();
                if (!word.isEmpty()) {
                    bannedWords.add(word);
                }
            }

        } catch (IOException e) { // IOException으로 변경 (Files.readAllLines 사용 안 함)
            System.err.println("Failed to load badwords.txt from Classpath.");
            e.printStackTrace();
            // 파일 로딩 실패 시 애플리케이션 시작은 되나, 비속어 필터링 기능은 작동하지 않습니다.
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
