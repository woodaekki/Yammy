package com.ssafy.yammy.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.type}")
    private String type;

    @Value("${firebase.project-id}")
    private String projectId;

    @Value("${firebase.private-key-id}")
    private String privateKeyId;

    @Value("${firebase.private-key}")
    private String privateKey;

    @Value("${firebase.client-email}")
    private String clientEmail;

    @Value("${firebase.client-id}")
    private String clientId;

    @Value("${firebase.auth-uri}")
    private String authUri;

    @Value("${firebase.token-uri}")
    private String tokenUri;

    @Value("${firebase.auth-provider-cert-url}")
    private String authProviderCertUrl;

    @Value("${firebase.client-cert-url}")
    private String clientCertUrl;

    @Value("${firebase.universe-domain}")
    private String universeDomain;

    @Value("${firebase.storage-bucket}")
    private String storageBucket;

    @PostConstruct
    public void init() throws Exception {
        if (FirebaseApp.getApps().isEmpty()) {
            // JSON 형태로 재구성
            String jsonContent = String.format(
                    "{" +
                            "\"type\":\"%s\"," +
                            "\"project_id\":\"%s\"," +
                            "\"private_key_id\":\"%s\"," +
                            "\"private_key\":\"%s\"," +
                            "\"client_email\":\"%s\"," +
                            "\"client_id\":\"%s\"," +
                            "\"auth_uri\":\"%s\"," +
                            "\"token_uri\":\"%s\"," +
                            "\"auth_provider_x509_cert_url\":\"%s\"," +
                            "\"client_x509_cert_url\":\"%s\"," +
                            "\"universe_domain\":\"%s\"" +
                            "}",
                    type,
                    projectId,
                    privateKeyId,
                    privateKey,  // 이미 \n이 포함되어 있음
                    clientEmail,
                    clientId,
                    authUri,
                    tokenUri,
                    authProviderCertUrl,
                    clientCertUrl,
                    universeDomain
            );

            // InputStream으로 변환
            ByteArrayInputStream serviceAccount = new ByteArrayInputStream(
                    jsonContent.getBytes(StandardCharsets.UTF_8)
            );

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setStorageBucket(storageBucket)
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("[Firebase] Admin SDK initialized with bucket: " + storageBucket);
        }
    }
}