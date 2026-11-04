package com.cuteicles.backend.security;

import com.cuteicles.backend.config.AppProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Sliding-window limiter for credential endpoints, per client address. In-memory, so it is per
 * instance; behind several instances or a proxy, rate limit at the proxy as well. Not a Spring bean on purpose.
 */
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Set<String> LIMITED = Set.of(
            "/api/auth/login", "/api/auth/register", "/api/auth/forgot-password",
            "/api/auth/reset-password", "/api/auth/change-password");
    private static final long WINDOW_MS = 60_000L;

    private final boolean enabled;
    private final int limit;
    private final ObjectMapper mapper;
    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();

    public RateLimitFilter(AppProperties props, ObjectMapper mapper) {
        this.enabled = props.security().rateLimit().enabled();
        this.limit = Math.max(1, props.security().rateLimit().authRequestsPerMinute());
        this.mapper = mapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        boolean write = "POST".equals(request.getMethod()) || "PATCH".equals(request.getMethod());
        if (enabled && write) {
            if (LIMITED.contains(request.getRequestURI())) {
                long now = System.currentTimeMillis();
                if (!allow(request.getRemoteAddr() + "|" + request.getRequestURI(), now)) {
                    response.setHeader("Retry-After", "60");
                    JsonErrors.write(mapper, request, response, HttpStatus.TOO_MANY_REQUESTS,
                            "Too many attempts. Please wait a minute and try again.");
                    return;
                }
            }
        }
        chain.doFilter(request, response);
    }

    private boolean allow(String key, long now) {
        if (hits.size() > 10_000) {
            hits.entrySet().removeIf(e -> e.getValue().isEmpty());
        }
        Deque<Long> window = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (window) {
            while (!window.isEmpty() && now - window.peekFirst() > WINDOW_MS) {
                window.pollFirst();
            }
            if (window.size() >= limit) {
                return false;
            }
            window.addLast(now);
            return true;
        }
    }
}
