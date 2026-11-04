package com.cuteicles.backend.cart;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "carts")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Cart() {}

    public Cart(Long userId, Instant now) {
        this.userId = userId;
        this.updatedAt = now;
    }

    public void touch(Instant now) { this.updatedAt = now; }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
}
