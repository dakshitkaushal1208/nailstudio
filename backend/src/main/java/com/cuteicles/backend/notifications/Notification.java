package com.cuteicles.backend.notifications;

/**
 * One outgoing message. "sensitive" messages (password reset) are never written to application logs;
 * in development they go to the dev outbox files only.
 */
public record Notification(
        NotificationType type,
        Long userId,
        String toEmail,
        String toName,
        String subject,
        String body,
        boolean sensitive) {}
