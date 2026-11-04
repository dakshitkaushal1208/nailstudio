package com.cuteicles.backend.cart;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cart_id", nullable = false)
    private Long cartId;

    @Column(name = "variant_id", nullable = false)
    private Long variantId;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected CartItem() {}

    public CartItem(Long cartId, Long variantId, int quantity, Instant now) {
        this.cartId = cartId;
        this.variantId = variantId;
        this.quantity = quantity;
        this.createdAt = now;
    }

    public Long getId() { return id; }
    public Long getCartId() { return cartId; }
    public Long getVariantId() { return variantId; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int q) { this.quantity = q; }
}
