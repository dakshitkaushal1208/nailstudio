package com.cuteicles.backend.auth;

import com.cuteicles.backend.users.User;
import com.cuteicles.backend.validation.IndianPhone;
import com.cuteicles.backend.validation.StrongPassword;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {}

    public static final String EMAIL_REGEX = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$";

    public record RegisterRequest(
            @NotBlank(message = "Enter your name.") @Size(min = 2, max = 100, message = "Enter your name.") String name,
            @NotBlank(message = "Enter your email address.") @Size(max = 190) @Pattern(regexp = EMAIL_REGEX, message = "Enter a valid email address.") String email,
            @NotBlank(message = "Enter a phone number so the studio can reach you.") @IndianPhone String phone,
            @NotBlank(message = "Choose a password.") @StrongPassword String password) {}

    public record LoginRequest(
            @NotBlank(message = "Enter your email address.") @Size(max = 190) String email,
            @NotBlank(message = "Enter your password.") @Size(max = 200) String password) {}

    public record UpdateProfileRequest(
            @NotBlank(message = "Enter your name.") @Size(min = 2, max = 100, message = "Enter your name.") String name,
            @IndianPhone String phone) {}

    public record ForgotPasswordRequest(
            @NotBlank @Size(max = 190) String email) {}

    public record ResetPasswordRequest(
            @NotBlank(message = "Enter your email address.") @Size(max = 190) String email,
            @NotBlank(message = "Enter the 6-digit code from your email.") @Size(max = 12) String code,
            @NotBlank(message = "Choose a password.") @StrongPassword String newPassword) {}

    public record ChangePasswordRequest(
            @NotBlank(message = "Enter your current password.") @Size(max = 200) String currentPassword,
            @NotBlank(message = "Choose a new password.") @StrongPassword String newPassword) {}

    public record MessageResponse(String message) {}

    /** Safe profile: no password hash, no lock state. "token" is only present when app.jwt.expose-token-in-body is on. */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record UserResponse(String id, String name, String email, String phone, String role, String token) {

        public static UserResponse of(User u) {
            return new UserResponse(String.valueOf(u.getId()), u.getName(), u.getEmail(), u.getPhone(), u.getRole().name(), null);
        }

        public UserResponse withToken(String token) {
            return new UserResponse(id, name, email, phone, role, token);
        }
    }
}
