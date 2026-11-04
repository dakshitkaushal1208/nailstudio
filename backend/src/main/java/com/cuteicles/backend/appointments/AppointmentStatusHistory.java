package com.cuteicles.backend.appointments;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "appointment_status_history")
public class AppointmentStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appointment_id", nullable = false)
    private Long appointmentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 20)
    private AppointmentStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 20)
    private AppointmentStatus toStatus;

    @Column(nullable = false, length = 2000)
    private String note = "";

    @Column(name = "changed_by")
    private Long changedBy;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;

    protected AppointmentStatusHistory() {}

    public AppointmentStatusHistory(Long appointmentId, AppointmentStatus from, AppointmentStatus to,
                                    String note, Long changedBy, Instant at) {
        this.appointmentId = appointmentId;
        this.fromStatus = from;
        this.toStatus = to;
        this.note = note == null ? "" : note;
        this.changedBy = changedBy;
        this.changedAt = at;
    }

    public Long getId() { return id; }
    public Long getAppointmentId() { return appointmentId; }
    public AppointmentStatus getFromStatus() { return fromStatus; }
    public AppointmentStatus getToStatus() { return toStatus; }
    public String getNote() { return note; }
    public Instant getChangedAt() { return changedAt; }
}
