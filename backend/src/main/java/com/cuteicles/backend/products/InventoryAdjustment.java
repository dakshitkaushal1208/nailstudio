package com.cuteicles.backend.products;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/** Audit trail of every manual stock change. */
@Entity
@Table(name = "inventory_adjustments")
public class InventoryAdjustment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "variant_id", nullable = false)
    private Long variantId;

    @Column(nullable = false)
    private int delta;

    @Column(nullable = false, length = 200)
    private String reason = "";

    @Column(name = "admin_id")
    private Long adminId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected InventoryAdjustment() {}

    public InventoryAdjustment(Long variantId, int delta, String reason, Long adminId, Instant now) {
        this.variantId = variantId;
        this.delta = delta;
        this.reason = reason;
        this.adminId = adminId;
        this.createdAt = now;
    }

    public Long getId() { return id; }
    public Long getVariantId() { return variantId; }
    public int getDelta() { return delta; }
    public String getReason() { return reason; }
    public Instant getCreatedAt() { return createdAt; }
}
