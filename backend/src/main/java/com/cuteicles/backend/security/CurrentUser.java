package com.cuteicles.backend.security;

import com.cuteicles.backend.common.ApiException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public final class CurrentUser {

    private CurrentUser() {}

    public static Optional<AuthUser> optional() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AuthUser user) {
            return Optional.of(user);
        }
        return Optional.empty();
    }

    public static AuthUser require() {
        return optional().orElseThrow(() -> ApiException.unauthorized("Please sign in to continue."));
    }

    public static boolean isAdmin() {
        return optional().map(AuthUser::isAdmin).orElse(false);
    }
}
