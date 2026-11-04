package com.cuteicles.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/** All custom settings live under the "app" prefix (see application.yml). */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Studio studio,
        Jwt jwt,
        Cors cors,
        Upload upload,
        Security security,
        Bootstrap bootstrap,
        Payments payments,
        Notifications notifications
) {
    public record Studio(String timezone) {}

    public record Jwt(
            String secret,
            String issuer,
            long ttlMinutes,
            String cookieName,
            boolean cookieSecure,
            String cookieSameSite,
            boolean exposeTokenInBody
    ) {}

    public record Cors(List<String> allowedOrigins) {}

    public record Upload(String dir, long maxBytes) {}

    public record Security(int loginMaxFailures, int loginLockMinutes, int resetTokenMinutes, RateLimit rateLimit) {}

    public record RateLimit(boolean enabled, int authRequestsPerMinute) {}

    public record Bootstrap(String adminEmail, String adminPassword, String adminName) {}

    public record Payments(String defaultMethod, boolean testModeEnabled) {}

    public record Notifications(boolean emailEnabled, String emailFrom, String devOutboxDir, String frontendBaseUrl) {}
}
