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
import java.util.Set;

/**
 * CSRF defence for cookie authentication. A browser always sends an Origin header on cross-site
 * POST/PUT/PATCH/DELETE requests; if it is present and not one of our own origins, the request is refused.
 * Requests with no Origin (curl, PowerShell, server-to-server) are not browser CSRF and pass through.
 * The cookie is also SameSite=Lax. Not a Spring bean on purpose.
 */
public class OriginCheckFilter extends OncePerRequestFilter {

    private static final Set<String> SAFE = Set.of("GET", "HEAD", "OPTIONS", "TRACE");

    private final Set<String> allowed;
    private final ObjectMapper mapper;

    public OriginCheckFilter(AppProperties props, ObjectMapper mapper) {
        this.allowed = Set.copyOf(props.cors().allowedOrigins());
        this.mapper = mapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String origin = request.getHeader("Origin");
        if (origin != null && !SAFE.contains(request.getMethod()) && !allowed.contains(origin) && !origin.equals(selfOrigin(request))) {
            JsonErrors.write(mapper, request, response, HttpStatus.FORBIDDEN, "This request came from an origin that is not allowed.");
            return;
        }
        chain.doFilter(request, response);
    }

    private String selfOrigin(HttpServletRequest request) {
        int port = request.getServerPort();
        boolean standard = ("http".equals(request.getScheme()) && port == 80) || ("https".equals(request.getScheme()) && port == 443);
        return request.getScheme() + "://" + request.getServerName() + (standard ? "" : ":" + port);
    }
}
