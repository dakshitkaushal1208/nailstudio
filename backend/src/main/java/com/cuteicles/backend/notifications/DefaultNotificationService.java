package com.cuteicles.backend.notifications;

import com.cuteicles.backend.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;

/**
 * Delivery order: real email if EMAIL_ENABLED=true and a mail server is configured; otherwise, in development
 * only, a text file in the dev outbox; otherwise nothing is delivered and the log says so.
 * Messages are sent after the surrounding transaction commits, so a rolled-back booking never emails anyone.
 * Message bodies, tokens and passwords are never written to the application log.
 */
@Service
public class DefaultNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(DefaultNotificationService.class);

    private final AppProperties props;
    private final NotificationLogRepository logs;
    private final ObjectProvider<JavaMailSender> mailSender;

    public DefaultNotificationService(AppProperties props, NotificationLogRepository logs,
                                      ObjectProvider<JavaMailSender> mailSender) {
        this.props = props;
        this.logs = logs;
        this.mailSender = mailSender;
        AppProperties.Notifications cfg = props.notifications();
        if (!cfg.emailEnabled() && (cfg.devOutboxDir() == null || cfg.devOutboxDir().isBlank())) {
            log.warn("EMAIL_ENABLED is false: password-reset codes and other emails will NOT be delivered. "
                    + "Set EMAIL_ENABLED=true, EMAIL_FROM and SPRING_MAIL_* to turn email on.");
        }
    }

    @Override
    public void send(Notification n) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    deliver(n);
                }
            });
        } else {
            deliver(n);
        }
    }

    private void deliver(Notification n) {
        try {
            AppProperties.Notifications cfg = props.notifications();
            JavaMailSender sender = mailSender.getIfAvailable();
            boolean hasAddress = n.toEmail() != null && !n.toEmail().isBlank();

            if (cfg.emailEnabled() && sender != null && hasAddress) {
                try {
                    SimpleMailMessage msg = new SimpleMailMessage();
                    if (cfg.emailFrom() != null && !cfg.emailFrom().isBlank()) {
                        msg.setFrom(cfg.emailFrom());
                    }
                    msg.setTo(n.toEmail());
                    msg.setSubject(n.subject());
                    msg.setText(n.body());
                    sender.send(msg);
                    record(n, "EMAIL", "SENT", null);
                } catch (Exception e) {
                    record(n, "EMAIL", "FAILED", e.getClass().getSimpleName());
                    log.warn("Email for {} could not be sent ({})", n.type(), e.getClass().getSimpleName());
                }
                return;
            }

            String outbox = cfg.devOutboxDir();
            if (outbox != null && !outbox.isBlank() && hasAddress) {
                Path dir = Paths.get(outbox).toAbsolutePath().normalize();
                Files.createDirectories(dir);
                Path file = dir.resolve(Instant.now().toEpochMilli() + "-" + n.type().name().toLowerCase() + "-" + n.userId() + ".txt");
                String content = "To: " + n.toEmail() + "\nSubject: " + n.subject() + "\n\n" + n.body() + "\n";
                Files.writeString(file, content, StandardCharsets.UTF_8);
                record(n, "DEV_OUTBOX", "WRITTEN", null);
                log.info("Dev outbox: {} written for user {}", n.type(), n.userId());
                return;
            }

            record(n, "NONE", "SKIPPED", "Email delivery is not enabled");
            log.info("Notification {} for user {} not delivered: email delivery is not enabled", n.type(), n.userId());
        } catch (Exception e) {
            log.warn("Notification {} failed ({})", n.type(), e.getClass().getSimpleName());
        }
    }

    private void record(Notification n, String channel, String status, String detail) {
        try {
            logs.save(new NotificationLog(n.type().name(), channel, n.userId(), status, detail));
        } catch (Exception e) {
            log.warn("Could not write notification log ({})", e.getClass().getSimpleName());
        }
    }
}
