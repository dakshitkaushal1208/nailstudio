package com.cuteicles.backend.auth;

import com.cuteicles.backend.auth.AuthDtos.ChangePasswordRequest;
import com.cuteicles.backend.auth.AuthDtos.ForgotPasswordRequest;
import com.cuteicles.backend.auth.AuthDtos.LoginRequest;
import com.cuteicles.backend.auth.AuthDtos.MessageResponse;
import com.cuteicles.backend.auth.AuthDtos.RegisterRequest;
import com.cuteicles.backend.auth.AuthDtos.ResetPasswordRequest;
import com.cuteicles.backend.auth.AuthDtos.UpdateProfileRequest;
import com.cuteicles.backend.auth.AuthDtos.UserResponse;
import com.cuteicles.backend.config.AppProperties;
import com.cuteicles.backend.security.CurrentUser;
import com.cuteicles.backend.security.SessionCookies;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;
    private final AppProperties props;

    public AuthController(AuthService auth, AppProperties props) {
        this.auth = auth;
        this.props = props;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest req, HttpServletRequest http) {
        return withCookie(HttpStatus.CREATED, auth.register(req, http.getHeader("User-Agent")));
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest req, HttpServletRequest http) {
        return withCookie(HttpStatus.OK, auth.login(req, http.getHeader("User-Agent")));
    }

    /** Safe to call without a session: it just clears the cookie. */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        auth.logout(CurrentUser.optional().orElse(null));
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, SessionCookies.clear(props))
                .build();
    }

    @GetMapping("/me")
    public UserResponse me() {
        return auth.me(CurrentUser.require());
    }

    @PatchMapping("/me")
    public UserResponse patchMe(@Valid @RequestBody UpdateProfileRequest req) {
        return auth.updateProfile(CurrentUser.require(), req);
    }

    /** The current frontend calls PUT; PATCH is the documented method. Both do the same thing. */
    @PutMapping("/me")
    public UserResponse putMe(@Valid @RequestBody UpdateProfileRequest req) {
        return auth.updateProfile(CurrentUser.require(), req);
    }

    @PostMapping("/forgot-password")
    public MessageResponse forgot(@Valid @RequestBody ForgotPasswordRequest req) {
        auth.forgotPassword(req.email());
        return new MessageResponse("If an account exists for that email, a 6-digit verification code has been sent.");
    }

    @PostMapping("/reset-password")
    public MessageResponse reset(@Valid @RequestBody ResetPasswordRequest req) {
        auth.resetPassword(req);
        return new MessageResponse("Your password has been changed. You can sign in now.");
    }

    @PatchMapping("/change-password")
    public MessageResponse change(@Valid @RequestBody ChangePasswordRequest req) {
        auth.changePassword(CurrentUser.require(), req);
        return new MessageResponse("Your password has been changed.");
    }

    private ResponseEntity<UserResponse> withCookie(HttpStatus status, AuthService.SessionResult result) {
        return ResponseEntity.status(status)
                .header(HttpHeaders.SET_COOKIE, SessionCookies.create(props, result.token(), result.maxAge()))
                .body(result.user());
    }
}
