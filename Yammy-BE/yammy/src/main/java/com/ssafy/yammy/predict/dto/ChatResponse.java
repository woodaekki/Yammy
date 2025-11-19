package com.ssafy.yammy.predict.dto;

import com.google.gson.Gson;
import java.util.List;
import java.util.Map;

public class ChatResponse {

    private String id;
    private String object;
    private long created;
    private String model;
    private List<Choice> choices;
    private Usage usage;

    public List<Choice> getChoices() {
        return choices;
    }

    public static class Choice {
        private int index;
        private Message message;
        private String finish_reason;

        public Message getMessage() {
            return message;
        }
    }

    public static class Message {
        private String role;
        private Object content;   // ★ GPT-4o 대응 핵심!

        public String getContent() {
            if (content == null) return "";

            // Case 1) content is String
            if (content instanceof String s) return s;

            // Case 2) content = List<Map<String, Object>>
            if (content instanceof List<?>) {
                List<?> list = (List<?>) content;
                if (!list.isEmpty() && list.get(0) instanceof Map<?, ?> map) {
                    Object text = map.get("text");
                    if (text instanceof String ts) return ts;
                }
            }

            // fallback
            return new Gson().toJson(content);
        }
    }

    public static class Usage {
        private int prompt_tokens;
        private int completion_tokens;
        private int total_tokens;
    }
}
