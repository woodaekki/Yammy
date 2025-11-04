package com.ssafy.yammy.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, UserDetailsService userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 공개 경로는 JWT 필터 건너뛰기
        String path = request.getRequestURI();
        if (path.startsWith("/api/v1/auth/signup") ||
                path.startsWith("/api/v1/auth/login") ||
                path.startsWith("/api/v1/auth/email") ||
                path.startsWith("/api/v1/auth/refresh") ||
                path.startsWith("/api/oauth/") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/api/v1/webhook/") ||
                path.equals("/favicon.ico")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        // Authorization 헤더 확인
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                if (jwtTokenProvider.validateToken(token)) {
                    String loginId = jwtTokenProvider.getLoginId(token);

                    // DB에서 UserDetails 조회 (로그인 ID 기반)
                    UserDetails userDetails = userDetailsService.loadUserByUsername(loginId);

                    // SecurityContext에 인증 객체 저장
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    // 토큰이 유효하지 않으면 401 반환 (프론트엔드의 자동 재발급 트리거)
                    log.warn("Invalid or expired JWT token");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
                    return;
                }
            } catch (Exception e) {
                // 토큰 처리 중 예외 발생 시 401 반환
                log.error("JWT token processing error", e);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write("{\"error\":\"Token processing error\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}