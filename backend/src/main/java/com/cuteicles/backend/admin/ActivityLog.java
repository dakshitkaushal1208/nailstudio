package com.cuteicles.backend.admin;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/** A short human-readable line for the admin overview ("New order NS-1042 placed"). */
@Entity
@Table(name = "activity_log")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String type;

    @Column(nullable = false, length = 300)
    private String body;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected ActivityLog() {}

    public ActivityLog(String type, String body) {
        this.type = type;
        this.body = body.length() > 300 ? body.substring(0, 300) : body;
    }

    public Long getId() { return id; }
    public String getType() { return type; }
    public String getBody() { return body; }
    public Instant getCreatedAt() { return createdAt; }
}
