package com.cuteicles.backend.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/** One signed-in browser. The JWT's id (jti) is this row's id; revoking the row ends the session. */
@Entity
@Table(name = "auth_sessions")
public class AuthSession {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    protected AuthSession() {}

    public AuthSession(String id, Long userId, Instant createdAt, Instant expiresAt, String userAgent) {
        this.id = id;
        this.userId = userId;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.userAgent = userAgent == null ? null : (userAgent.length() > 255 ? userAgent.substring(0, 255) : userAgent);
    }

    public boolean isActive(Instant now) {
        return revokedAt == null && expiresAt.isAfter(now);
    }

    public void revoke(Instant now) {
        if (revokedAt == null) {
            revokedAt = now;
        }
    }

    public String getId() { return id; }
    public Long getUserId() { return userId; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getRevokedAt() { return revokedAt; }
}
