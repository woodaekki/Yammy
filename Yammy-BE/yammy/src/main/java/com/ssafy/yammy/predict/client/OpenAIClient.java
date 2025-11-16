package com.ssafy.yammy.predict.client;

import com.ssafy.yammy.predict.dto.ChatRequest;
import com.ssafy.yammy.predict.dto.ChatResponse;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Headers;
import retrofit2.http.POST;

public interface OpenAIClient {

    @Headers("Content-Type: application/json")
    @POST("chat/completions")
    Call<ChatResponse> chatCompletion(@Body ChatRequest request);
}
