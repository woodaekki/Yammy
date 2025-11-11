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

        // OPTIONS 요청은 무조건 통과 (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // 공개 경로는 JWT 필터 건너뛰기
        String path = request.getRequestURI();
        if (path.startsWith("/api/auth/signup") ||
                path.startsWith("/api/auth/login") ||
                path.startsWith("/api/auth/email") ||
                path.startsWith("/api/auth/refresh") ||
                path.startsWith("/api/oauth/") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/api/v1/webhook/") ||
                path.equals("/favicon.ico")) {
            log.info("🐈 [JWT 필터] 공개 경로 통과: {}", path);
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        log.info("🐈 [JWT 필터] Path: {}, AuthHeader exists: {}", path, authHeader != null);
        
        if (authHeader != null) {
            log.info("🐈 [JWT 필터] AuthHeader value: {}", authHeader.substring(0, Math.min(authHeader.length(), 50)) + "...");
        }

        // Authorization 헤더 확인
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            log.info("🐈 [JWT 필터] Token extracted, length: {}", token.length());

            try {
                if (jwtTokenProvider.validateToken(token)) {
                    String loginId = jwtTokenProvider.getLoginId(token);
                    log.info("🟢 [JWT 필터] Valid token for loginId: {}", loginId);

                    // DB에서 UserDetails 조회 (로그인 ID 기반)
                    UserDetails userDetails = userDetailsService.loadUserByUsername(loginId);
                    log.info("🟢 [JWT 필터] UserDetails loaded: {}", userDetails.getUsername());

                    // SecurityContext에 인증 객체 저장
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.info("🟢 [JWT 필터] Authentication set in SecurityContext");
                } else {
                    // 토큰이 유효하지 않으면 401 반환 (프론트엔드의 자동 재발급 트리거)
                    log.warn("🔴 [JWT 필터] Invalid or expired JWT token");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
                    return;
                }
            } catch (Exception e) {
                // 토큰 처리 중 예외 발생 시 401 반환
                log.error("🔴 [JWT 필터] JWT token processing error", e);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write("{\"error\":\"Token processing error\"}");
                return;
            }
        } else {
            log.warn("🔴 [JWT 필터] No valid Authorization header for path: {}", path);
        }

        log.info("🟢 [JWT 필터] Filter chain continuing for path: {}", path);
        filterChain.doFilter(request, response);
    }
}