package com.ssafy.yammy.predict.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.yammy.predict.client.OpenAIClient;
import com.ssafy.yammy.predict.dto.AiPickResult;
import com.ssafy.yammy.predict.dto.ChatRequest;
import com.ssafy.yammy.predict.entity.PredictedMatches;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class OpenAIService {

    private final OpenAIClient openAIClient;
    private final String model;
    private final ObjectMapper mapper = new ObjectMapper();

    public OpenAIService(
            @Value("${openai.key}") String apiKey,
            @Value("${openai.model}") String model
    ) {

        System.out.println("### Loaded GMS KEY = [" + apiKey + "]");
        this.model = model;

        OkHttpClient client = new OkHttpClient.Builder()
                .addInterceptor(chain -> {
                    Request req = chain.request().newBuilder()
                            .addHeader("Authorization", "Bearer " + apiKey)
                            .addHeader("Content-Type", "application/json")
                            .build();
                    return chain.proceed(req);
                })
                .build();

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("https://gms.ssafy.io/gmsapi/api.openai.com/v1/") // ← 가장 중요
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        this.openAIClient = retrofit.create(OpenAIClient.class);
    }

    public String ask(String prompt) throws IOException {

        ChatRequest request = new ChatRequest(
                model,
                List.of(new ChatRequest.Message("user", prompt))
        );

        var response = openAIClient.chatCompletion(request).execute();

        if (!response.isSuccessful()) {
            return "HTTP " + response.code() + "\n" + response.errorBody().string();
        }

        return response.body().getChoices().get(0).getMessage().getContent();
    }

    /**
     * 오늘 경기 전체를 한번에 GPT에게 보내고
     * [ {home, away, pick}, ... ]  형태로 리턴받기
     */
    public List<AiPickResult> askMatchPicks(List<PredictedMatches> matches) throws IOException {

        String matchJson = mapper.writeValueAsString(
                matches.stream()
                        .map(m -> Map.of(
                                "home", m.getHome(),
                                "away", m.getAway()
                        ))
                        .toList()
        );

        String prompt = """
                다음은 오늘 야구 경기 목록이다.
                각 경기에서 승리할 확률이 더 높은 팀을 골라서
                JSON 배열 형태로 반환해라.
                
                규칙:
                - pick = 0 → home팀 승
                - pick = 1 → away팀 승
                - 설명 금지
                - 예시와 동일 형식으로 출력

                예시:
                [
                    {"home":"LG","away":"KT","pick":1},
                    {"home":"SSG","away":"롯데","pick":0}
                ]

                경기 목록:
                """ + matchJson;

        ChatRequest request = new ChatRequest(
                model,
                List.of(new ChatRequest.Message("user", prompt))
        );

        var response = openAIClient.chatCompletion(request).execute();

        if (!response.isSuccessful()) {
            throw new RuntimeException("GPT Error: " + response.errorBody().string());
        }

        String content = response.body().getChoices().get(0).getMessage().getContent();

        // GPT가 코드블록으로 감싸는 경우 제거
        content = content.trim()
                .replace("```json", "")
                .replace("```", "")
                .trim();

        return mapper.readValue(content, new TypeReference<List<AiPickResult>>() {});
    }

}
