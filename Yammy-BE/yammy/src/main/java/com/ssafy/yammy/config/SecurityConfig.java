package com.ssafy.yammy.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // JWT 기반이므로 CSRF 불필요
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS 통합
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/signup").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/logout").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/email/**").permitAll()
                        .requestMatchers("/api/auth/refresh").permitAll()
                        .requestMatchers("/api/oauth/**").permitAll() // 카카오 OAuth

                        // 경기 정보 조회 (공개)
                        .requestMatchers(HttpMethod.GET, "/api/matches/**").permitAll()

                        // 승부예측 API 세분화 (임시: 모든 API 공개)
                        .requestMatchers("/api/predict/**").permitAll()

                        // 인증 필요한 Auth 엔드포인트
                        .requestMatchers(HttpMethod.PUT, "/api/auth/password").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/auth/update").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/auth/delete").authenticated()

                        // 팔로우 목록 조회는 누구나 가능
                        .requestMatchers(HttpMethod.GET, "/api/follows/followers/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/follows/following/**").permitAll()
                        // 팔로우/언팔로우/상태 확인은 인증 필요
                        .requestMatchers("/api/follows/**").authenticated()

                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/swagger-resources/**").permitAll()
                        .requestMatchers("/webjars/**").permitAll()
                        .requestMatchers("/api/v1/webhook/**").permitAll()

                        // 중고거래 — 읽기는 공개, 쓰기는 인증 필요
                        .requestMatchers(HttpMethod.GET, "/api/trades/**").permitAll()       // 조회는 누구나
                        .requestMatchers(HttpMethod.POST, "/api/trades/**").authenticated()  // 작성은 로그인 필요
                        .requestMatchers(HttpMethod.PUT, "/api/trades/**").authenticated()   // 수정은 로그인 필요
                        .requestMatchers(HttpMethod.DELETE, "/api/trades/**").authenticated()// 삭제는 로그인 필요

                        // 중고거래 채팅
                        .requestMatchers("/api/useditem/chat/**").authenticated()

                        // 중고거래 에스크로
                        .requestMatchers("/api/escrow/**").authenticated()

                        // 사진 업로드
                        .requestMatchers("/api/photos/**").authenticated()

                        // 포인트 충전 및 조회
                        .requestMatchers("/api/payments/**").authenticated()
                        .requestMatchers("/api/points/**").authenticated()
                        
                        // 티켓 - 인증 필요
                        .requestMatchers("/api/tickets/**").authenticated()

                        .requestMatchers("/api/v1/ai/**").permitAll()
                        .requestMatchers("/favicon.ico").permitAll()
                        .requestMatchers("/api/admin/chat-rooms/**").hasRole("ADMIN")
                        .requestMatchers("/api/chat/**").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 개발 + 운영 도메인 함께 허용
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://k13c205.p.ssafy.io"
        ));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("*"));
        configuration.setAllowCredentials(true); // JWT 쿠키/헤더 모두 허용
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}