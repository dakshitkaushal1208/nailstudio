package com.cuteicles.backend.security;

import com.cuteicles.backend.config.AppProperties;
import org.springframework.http.ResponseCookie;

import java.time.Duration;

/** Builds the HttpOnly session cookie. The browser's JavaScript can never read it. */
public final class SessionCookies {

    private SessionCookies() {}

    public static String create(AppProperties props, String token, Duration maxAge) {
        return base(props, token).maxAge(maxAge).build().toString();
    }

    public static String clear(AppProperties props) {
        return base(props, "").maxAge(Duration.ZERO).build().toString();
    }

    private static ResponseCookie.ResponseCookieBuilder base(AppProperties props, String value) {
        AppProperties.Jwt jwt = props.jwt();
        return ResponseCookie.from(jwt.cookieName(), value)
                .httpOnly(true)
                .secure(jwt.cookieSecure())
                .sameSite(jwt.cookieSameSite())
                .path("/");
    }
}
