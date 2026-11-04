package com.cuteicles.backend.security;

import com.cuteicles.backend.users.Role;

/** The authenticated caller, built from the verified JWT plus the live user and session rows. */
public record AuthUser(Long id, String email, Role role, String sessionId) {

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }
}
