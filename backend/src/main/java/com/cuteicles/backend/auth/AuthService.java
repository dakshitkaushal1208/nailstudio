package com.cuteicles.backend.auth;

import com.cuteicles.backend.auth.AuthDtos.ChangePasswordRequest;
import com.cuteicles.backend.auth.AuthDtos.LoginRequest;
import com.cuteicles.backend.auth.AuthDtos.RegisterRequest;
import com.cuteicles.backend.auth.AuthDtos.ResetPasswordRequest;
import com.cuteicles.backend.auth.AuthDtos.UpdateProfileRequest;
import com.cuteicles.backend.auth.AuthDtos.UserResponse;
import com.cuteicles.backend.common.ApiException;
import com.cuteicles.backend.common.Texts;
import com.cuteicles.backend.config.AppProperties;
import com.cuteicles.backend.notifications.Notifier;
import com.cuteicles.backend.security.AuthUser;
import com.cuteicles.backend.security.JwtService;
import com.cuteicles.backend.users.Role;
import com.cuteicles.backend.users.User;
import com.cuteicles.backend.users.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);
    private static final String BAD_LOGIN = "That email and password do not match.";

    private final UserRepository users;
    private final AuthSessionRepository sessions;
    private final PasswordResetTokenRepository resetTokens;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final AppProperties props;
    private final Notifier notifier;
    private final SecureRandom random = new SecureRandom();
    private final String dummyHash;

    public AuthService(UserRepository users, AuthSessionRepository sessions, PasswordResetTokenRepository resetTokens,
                       PasswordEncoder encoder, JwtService jwt, AppProperties props, Notifier notifier) {
        this.users = users;
        this.sessions = sessions;
        this.resetTokens = resetTokens;
        this.encoder = encoder;
        this.jwt = jwt;
        this.props = props;
        this.notifier = notifier;
        // Compared against when the email is unknown, so "no such user" costs the same time as "wrong password".
        this.dummyHash = encoder.encode("not-a-real-password-" + UUID.randomUUID());
    }

    /** A signed-in session: the profile to return plus the token for the cookie. */
    public record SessionResult(UserResponse user, String token, Duration maxAge) {}

    @Transactional
    public SessionResult register(RegisterRequest req, String userAgent) {
        String email = req.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists.",
                    java.util.Map.of("email", "This email is already registered."));
        }
        User user = new User();
        user.setName(req.name().trim());
        user.setEmail(email);
        user.setPhone(Texts.compactPhone(req.phone()));
        user.setPasswordHash(encoder.encode(req.password()));
        user.setRole(Role.CUSTOMER); // never taken from the request
        user = users.save(user);
        return startSession(user, userAgent);
    }

    // The failed-attempt counter must be saved even though login then throws, so ApiException does not roll back.
    @Transactional(noRollbackFor = ApiException.class)
    public SessionResult login(LoginRequest req, String userAgent) {
        Instant now = Instant.now();
        Optional<User> found = users.findByEmailIgnoreCase(req.email().trim());
        if (found.isEmpty()) {
            encoder.matches(req.password(), dummyHash);
            throw ApiException.unauthorized(BAD_LOGIN);
        }
        User user = found.get();
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(now)) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many failed attempts. Please try again later.");
        }
        if (!user.isEnabled() || !encoder.matches(req.password(), user.getPasswordHash())) {
            if (user.isEnabled()) {
                int failures = user.getFailedLoginAttempts() + 1;
                if (failures >= props.security().loginMaxFailures()) {
                    user.setLockedUntil(now.plus(Duration.ofMinutes(props.security().loginLockMinutes())));
                    failures = 0;
                }
                user.setFailedLoginAttempts(failures);
                users.save(user);
            }
            throw ApiException.unauthorized(BAD_LOGIN);
        }
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        users.save(user);
        return startSession(user, userAgent);
    }

    @Transactional
    public void logout(AuthUser current) {
        if (current != null) {
            sessions.findById(current.sessionId()).ifPresent(s -> s.revoke(Instant.now()));
        }
    }

    @Transactional(readOnly = true)
    public UserResponse me(AuthUser current) {
        return UserResponse.of(load(current.id()));
    }

    @Transactional
    public UserResponse updateProfile(AuthUser current, UpdateProfileRequest req) {
        User user = load(current.id());
        user.setName(req.name().trim());
        user.setPhone(Texts.compactPhone(req.phone()));
        return UserResponse.of(users.save(user));
    }

    @Transactional
    public void changePassword(AuthUser current, ChangePasswordRequest req) {
        User user = load(current.id());
        if (!encoder.matches(req.currentPassword(), user.getPasswordHash())) {
            throw ApiException.invalid("currentPassword", "That is not your current password.");
        }
        user.setPasswordHash(encoder.encode(req.newPassword()));
        users.save(user);
        // Every other browser is signed out; this one stays.
        sessions.revokeAllForUser(user.getId(), current.sessionId(), Instant.now());
    }

    /**
     * Emails a 6-digit code. Always succeeds from the caller's point of view, so it cannot be used to find out
     * which emails exist. At most one code per user per minute (stops email flooding).
     */
    @Transactional
    public void forgotPassword(String emailInput) {
        Optional<User> found = users.findByEmailIgnoreCase(emailInput.trim());
        if (found.isEmpty() || !found.get().isEnabled()) {
            return;
        }
        User user = found.get();
        Instant now = Instant.now();
        Instant last = resetTokens.latestCreatedAt(user.getId());
        if (last != null && last.plus(RESEND_COOLDOWN).isAfter(now)) {
            return;
        }
        resetTokens.invalidateAllForUser(user.getId(), now);

        String code = ResetCode.generate(random);
        Instant expires = now.plus(Duration.ofMinutes(props.security().resetTokenMinutes()));
        resetTokens.save(new PasswordResetToken(user.getId(), codeHash(user.getId(), code), expires, now));

        notifier.passwordReset(user.getId(), user.getEmail(), user.getName(), code);
    }

    /**
     * Checks the emailed code (max 5 wrong guesses per code), then sets the new password and signs out every device.
     * noRollbackFor is essential: the failed-guess counter must still be saved when we answer "wrong code".
     */
    @Transactional(noRollbackFor = ApiException.class)
    public void resetPassword(ResetPasswordRequest req) {
        Instant now = Instant.now();
        String code = req.code().trim();
        User user = users.findByEmailIgnoreCase(req.email().trim()).filter(User::isEnabled).orElse(null);
        if (user == null) {
            codeHash(0L, code); // same work as the real path, so timing does not reveal unknown emails
            throw badCode();
        }
        List<PasswordResetToken> active = resetTokens.findActive(user.getId(), now);
        if (active.isEmpty()) {
            throw badCode();
        }
        PasswordResetToken token = active.get(0);
        // Count this guess first (atomic). Once 5 are used the code is dead, even if the 6th guess is right.
        if (resetTokens.countAttempt(token.getId(), ResetCode.MAX_ATTEMPTS) != 1) {
            resetTokens.consume(token.getId(), now);
            throw badCode();
        }
        if (!ResetCode.isWellFormed(code) || !ResetCode.sameHash(token.getTokenHash(), codeHash(user.getId(), code))) {
            throw badCode();
        }
        // consume() is an atomic compare-and-set, so a code can never be used twice, even concurrently.
        if (resetTokens.consume(token.getId(), now) != 1) {
            throw badCode();
        }
        user.setPasswordHash(encoder.encode(req.newPassword()));
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        users.save(user);
        sessions.revokeAllForUser(user.getId(), "", now);
    }

    private String codeHash(Long userId, String code) {
        return jwt.hmacHex(userId + ":" + code);
    }

    private static ApiException badCode() {
        return new ApiException(HttpStatus.BAD_REQUEST, "That code is not correct or has expired. Please check it or request a new one.");
    }

    private SessionResult startSession(User user, String userAgent) {
        Instant now = Instant.now();
        Duration ttl = Duration.ofMinutes(props.jwt().ttlMinutes());
        Instant expires = now.plus(ttl);
        String sessionId = UUID.randomUUID().toString();
        sessions.save(new AuthSession(sessionId, user.getId(), now, expires, userAgent));
        sessions.deleteExpiredBefore(now.minus(Duration.ofDays(1)));
        String token = jwt.issue(user, sessionId, now, expires);
        UserResponse profile = UserResponse.of(user);
        return new SessionResult(props.jwt().exposeTokenInBody() ? profile.withToken(token) : profile, token, ttl);
    }

    private User load(Long id) {
        return users.findById(id).orElseThrow(() -> ApiException.unauthorized("Please sign in to continue."));
    }

    static String sha256(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
