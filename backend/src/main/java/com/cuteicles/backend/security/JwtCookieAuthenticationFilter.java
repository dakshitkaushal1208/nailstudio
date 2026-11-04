package com.cuteicles.backend.security;

import com.cuteicles.backend.auth.AuthSession;
import com.cuteicles.backend.auth.AuthSessionRepository;
import com.cuteicles.backend.config.AppProperties;
import com.cuteicles.backend.users.User;
import com.cuteicles.backend.users.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Reads the session JWT from the HttpOnly cookie (or an Authorization: Bearer header for Swagger and scripts),
 * verifies it, then checks that its session row is still active, so logout and password changes take effect at once.
 * The role always comes from the database, never from the token.
 * Not a Spring bean on purpose: it is added to the security chain only.
 */
public class JwtCookieAuthenticationFilter extends OncePerRequestFilter {

    private final AppProperties props;
    private final JwtService jwtService;
    private final AuthSessionRepository sessions;
    private final UserRepository users;

    public JwtCookieAuthenticationFilter(AppProperties props, JwtService jwtService,
                                         AuthSessionRepository sessions, UserRepository users) {
        this.props = props;
        this.jwtService = jwtService;
        this.sessions = sessions;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String token = extractToken(request);
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                jwtService.parse(token).flatMap(this::toAuthUser).ifPresent(user -> {
                    var auth = new UsernamePasswordAuthenticationToken(user, null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + user.role().name())));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                });
            } catch (RuntimeException ignored) {
                // Any problem means "not signed in"; the entry point answers 401.
            }
        }
        chain.doFilter(request, response);
    }

    private Optional<AuthUser> toAuthUser(Claims claims) {
        Long userId;
        try {
            userId = Long.parseLong(claims.getSubject());
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
        Optional<AuthSession> session = sessions.findById(claims.getId());
        if (session.isEmpty() || !session.get().isActive(Instant.now()) || !userId.equals(session.get().getUserId())) {
            return Optional.empty();
        }
        Optional<User> user = users.findById(userId);
        if (user.isEmpty() || !user.get().isEnabled()) {
            return Optional.empty();
        }
        User u = user.get();
        return Optional.of(new AuthUser(u.getId(), u.getEmail(), u.getRole(), claims.getId()));
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.regionMatches(true, 0, "Bearer ", 0, 7)) {
            String t = header.substring(7).trim();
            return t.isEmpty() ? null : t;
        }
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if (props.jwt().cookieName().equals(c.getName()) && c.getValue() != null && !c.getValue().isBlank()) {
                    return c.getValue();
                }
            }
        }
        return null;
    }
}
