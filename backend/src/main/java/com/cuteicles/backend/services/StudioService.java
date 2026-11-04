package com.cuteicles.backend.services;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

/** A treatment the studio offers (table "services"). */
@Entity
@Table(name = "services")
public class StudioService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 170)
    private String slug;

    @Column(nullable = false, length = 2000)
    private String description = "";

    @Column(nullable = false, length = 80)
    private String category = "";

    /** null = "price confirmed by the studio". */
    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "duration_min", nullable = false)
    private int durationMin;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String v) { this.name = v; }
    public String getSlug() { return slug; }
    public void setSlug(String v) { this.slug = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public String getCategory() { return category; }
    public void setCategory(String v) { this.category = v; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal v) { this.price = v; }
    public int getDurationMin() { return durationMin; }
    public void setDurationMin(int v) { this.durationMin = v; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String v) { this.imageUrl = v; }
    public boolean isActive() { return active; }
    public void setActive(boolean v) { this.active = v; }
    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int v) { this.displayOrder = v; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
