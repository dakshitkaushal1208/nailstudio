package com.cuteicles.backend.orders;

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
@Table(name = "order_status_history")
public class OrderStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    @Column(name = "changed_by")
    private Long changedBy;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;

    protected OrderStatusHistory() {}

    public OrderStatusHistory(Long orderId, OrderStatus status, Long changedBy, Instant at) {
        this.orderId = orderId;
        this.status = status;
        this.changedBy = changedBy;
        this.changedAt = at;
    }

    public Long getOrderId() { return orderId; }
    public OrderStatus getStatus() { return status; }
    public Instant getChangedAt() { return changedAt; }
}
