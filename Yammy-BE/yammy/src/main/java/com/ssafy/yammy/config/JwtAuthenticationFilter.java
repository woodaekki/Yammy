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

        String path = request.getRequestURI();
        log.info("🔍 [JWT Filter] Request URI: {}", path);

        // 공개 경로는 JWT 필터 건너뛰기
        if (path.startsWith("/api/v1/auth/") ||
                path.startsWith("/api/oauth/") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/api/v1/webhook/") ||
                path.equals("/favicon.ico")) {
            log.info("⏭️ [JWT Filter] Skipping public path: {}", path);
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        log.info("🔑 [JWT Filter] Authorization header: {}", authHeader != null ? "Present" : "Missing");

        // Authorization 헤더 확인
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            log.info("🎫 [JWT Filter] Token extracted (first 20 chars): {}...", token.substring(0, Math.min(20, token.length())));

            if (jwtTokenProvider.validateToken(token)) {
                log.info("✅ [JWT Filter] Token is valid");

                String loginId = jwtTokenProvider.getLoginId(token);
                log.info("👤 [JWT Filter] LoginId from token: {}", loginId);

                try {
                    // DB에서 UserDetails 조회 (로그인 ID 기반)
                    UserDetails userDetails = userDetailsService.loadUserByUsername(loginId);
                    log.info("✅ [JWT Filter] UserDetails loaded: username={}, authorities={}",
                            userDetails.getUsername(),
                            userDetails.getAuthorities());

                    // SecurityContext에 인증 객체 저장
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.info("🔐 [JWT Filter] Authentication set in SecurityContext");
                    log.info("🔐 [JWT Filter] Current authentication: {}",
                            SecurityContextHolder.getContext().getAuthentication());

                } catch (Exception e) {
                    log.error("❌ [JWT Filter] Failed to load user or set authentication: {}", e.getMessage(), e);
                }
            } else {
                log.warn("❌ [JWT Filter] Token validation failed");
            }
        } else {
            log.warn("⚠️ [JWT Filter] No valid Authorization header");
        }

        log.info("➡️ [JWT Filter] Proceeding to next filter. Authentication present: {}",
                SecurityContextHolder.getContext().getAuthentication() != null);

        filterChain.doFilter(request, response);
    }
}