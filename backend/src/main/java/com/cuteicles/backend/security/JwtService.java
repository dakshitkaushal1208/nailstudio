package com.cuteicles.backend.security;

import com.cuteicles.backend.config.AppProperties;
import com.cuteicles.backend.users.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Date;
import java.util.HexFormat;
import java.util.Optional;

/** Signs and verifies session JWTs (HS256/HS384/HS512 chosen by key length). */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private final SecretKey key;
    private final String issuer;

    public JwtService(AppProperties props, Environment env) {
        String secret = props.jwt().secret();
        if (secret == null || secret.isBlank()) {
            if (env.acceptsProfiles(Profiles.of("dev", "test"))) {
                byte[] random = new byte[48];
                new SecureRandom().nextBytes(random);
                secret = HexFormat.of().formatHex(random);
                log.warn("JWT_SECRET is not set. A temporary secret was generated; all sessions end when the app restarts.");
            } else {
                throw new IllegalStateException("JWT_SECRET must be set (at least 32 characters) outside the dev profile.");
            }
        }
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 characters long.");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
        this.issuer = props.jwt().issuer();
    }

    /** Keyed hash for short secrets (reset codes). Not reversible without the server's JWT secret. */
    public String hmacHex(String message) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(key.getEncoded(), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(("pwreset:" + message).getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.GeneralSecurityException e) {
            throw new IllegalStateException("HmacSHA256 is not available", e);
        }
    }

    public String issue(User user, String sessionId, Instant issuedAt, Instant expiresAt) {
        return Jwts.builder()
                .id(sessionId)
                .subject(String.valueOf(user.getId()))
                .issuer(issuer)
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiresAt))
                .claim("role", user.getRole().name())
                .signWith(key)
                .compact();
    }

    /** Returns the claims only if the signature, issuer, expiry and required claims are all valid. */
    public Optional<Claims> parse(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .requireIssuer(issuer)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            if (claims.getId() == null || claims.getSubject() == null || claims.getExpiration() == null) {
                return Optional.empty();
            }
            return Optional.of(claims);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
