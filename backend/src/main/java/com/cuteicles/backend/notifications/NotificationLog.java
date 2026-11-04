package com.cuteicles.backend.notifications;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/** A delivery record: what kind of message, to which user, and what happened. No message content. */
@Entity
@Table(name = "notification_log")
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40)
    private String type;

    @Column(nullable = false, length = 20)
    private String channel;

    @Column(name = "recipient_user_id")
    private Long recipientUserId;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(length = 200)
    private String detail;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected NotificationLog() {}

    public NotificationLog(String type, String channel, Long recipientUserId, String status, String detail) {
        this.type = type;
        this.channel = channel;
        this.recipientUserId = recipientUserId;
        this.status = status;
        this.detail = detail == null ? null : (detail.length() > 200 ? detail.substring(0, 200) : detail);
    }

    public Long getId() { return id; }
    public String getType() { return type; }
    public String getChannel() { return channel; }
    public Long getRecipientUserId() { return recipientUserId; }
    public String getStatus() { return status; }
    public String getDetail() { return detail; }
    public Instant getCreatedAt() { return createdAt; }
}
