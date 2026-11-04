package com.cuteicles.backend.auth;

import com.cuteicles.backend.config.AppProperties;
import com.cuteicles.backend.users.Role;
import com.cuteicles.backend.users.User;
import com.cuteicles.backend.users.UserRepository;
import com.cuteicles.backend.validation.StrongPasswordValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Creates the first administrator from ADMIN_EMAIL / ADMIN_PASSWORD, only if that email has no account yet.
 * There are no built-in accounts. The password is never logged.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final AppProperties props;
    private final UserRepository users;
    private final PasswordEncoder encoder;

    public AdminBootstrap(AppProperties props, UserRepository users, PasswordEncoder encoder) {
        this.props = props;
        this.users = users;
        this.encoder = encoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        String email = props.bootstrap().adminEmail();
        String password = props.bootstrap().adminPassword();
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            if (!users.existsByRole(Role.ADMIN)) {
                log.warn("No administrator exists. Set ADMIN_EMAIL and ADMIN_PASSWORD and restart to create one.");
            }
            return;
        }
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(normalized)) {
            return;
        }
        if (!StrongPasswordValidator.isStrong(password)) {
            log.error("ADMIN_PASSWORD is too weak (8 to 72 characters with a letter and a number). Administrator not created.");
            return;
        }
        User admin = new User();
        admin.setName(props.bootstrap().adminName() == null || props.bootstrap().adminName().isBlank()
                ? "Studio Owner" : props.bootstrap().adminName().trim());
        admin.setEmail(normalized);
        admin.setPasswordHash(encoder.encode(password));
        admin.setRole(Role.ADMIN);
        users.save(admin);
        log.info("Administrator account created for {}", normalized);
    }
}
