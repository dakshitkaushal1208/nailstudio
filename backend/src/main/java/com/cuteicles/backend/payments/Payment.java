package com.cuteicles.backend.payments;

import com.cuteicles.backend.orders.PaymentStatus;
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

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(nullable = false, length = 20)
    private String method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "provider_reference", length = 100)
    private String providerReference;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Payment() {}

    public Payment(Long orderId, String method, PaymentStatus status, BigDecimal amount, String ref, Instant now) {
        this.orderId = orderId;
        this.method = method;
        this.status = status;
        this.amount = amount;
        this.providerReference = ref;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void setStatus(PaymentStatus s, Instant now) {
        this.status = s;
        this.updatedAt = now;
    }

    public Long getId() { return id; }
    public Long getOrderId() { return orderId; }
    public String getMethod() { return method; }
    public PaymentStatus getStatus() { return status; }
    public BigDecimal getAmount() { return amount; }
    public String getProviderReference() { return providerReference; }
}
