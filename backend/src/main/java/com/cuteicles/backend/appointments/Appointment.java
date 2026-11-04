package com.cuteicles.backend.appointments;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "service_id", nullable = false)
    private Long serviceId;

    /** Snapshot: later edits to the service must not rewrite booking history. */
    @Column(name = "service_name", nullable = false)
    private String serviceName;

    private BigDecimal price;

    @Column(name = "duration_min", nullable = false)
    private int durationMin;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_email", nullable = false)
    private String customerEmail = "";

    @Column(name = "customer_phone", nullable = false)
    private String customerPhone;

    @Column(nullable = false, length = 2000)
    private String notes = "";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Column(name = "admin_note", nullable = false, length = 2000)
    private String adminNote = "";

    @Column(name = "cancellation_reason", nullable = false, length = 500)
    private String cancellationReason = "";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Appointment() {}

    public Appointment(Long userId, Long serviceId, String serviceName, BigDecimal price, int durationMin,
                       LocalDate date, LocalTime start, LocalTime end,
                       String customerName, String customerEmail, String customerPhone, String notes, Instant now) {
        this.userId = userId;
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.price = price;
        this.durationMin = durationMin;
        this.appointmentDate = date;
        this.startTime = start;
        this.endTime = end;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.notes = notes;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void changeStatus(AppointmentStatus to, Instant now) {
        this.status = to;
        this.updatedAt = now;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getServiceId() { return serviceId; }
    public String getServiceName() { return serviceName; }
    public BigDecimal getPrice() { return price; }
    public int getDurationMin() { return durationMin; }
    public LocalDate getAppointmentDate() { return appointmentDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public String getCustomerName() { return customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public String getCustomerPhone() { return customerPhone; }
    public String getNotes() { return notes; }
    public AppointmentStatus getStatus() { return status; }
    public String getAdminNote() { return adminNote; }
    public void setAdminNote(String v) { this.adminNote = v; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String v) { this.cancellationReason = v; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
