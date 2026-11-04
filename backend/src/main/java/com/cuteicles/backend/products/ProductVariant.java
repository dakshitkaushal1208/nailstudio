package com.cuteicles.backend.products;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * A sellable combination of options with its own stock. Stock is never changed by setting a field
 * during a purchase: orders use the atomic queries in ProductVariantRepository.
 */
@Entity
@Table(name = "product_variants")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", insertable = false, updatable = false)
    private Long productId;

    @Column(nullable = false, length = 60)
    private String sku = "";

    @Column(nullable = false)
    private int stock;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @ElementCollection
    @CollectionTable(name = "variant_selections", joinColumns = @JoinColumn(name = "variant_id"))
    @MapKeyColumn(name = "option_name")
    @Column(name = "option_value", nullable = false, length = 80)
    private Map<String, String> selections = new LinkedHashMap<>();

    protected ProductVariant() {}

    public ProductVariant(String sku, int stock, boolean active, Map<String, String> selections, Instant now) {
        this.sku = sku;
        this.stock = stock;
        this.active = active;
        this.selections = new LinkedHashMap<>(selections);
        this.createdAt = now;
    }


    public Long getId() { return id; }
    public Long getProductId() { return productId; }
    public String getSku() { return sku; }
    public void setSku(String v) { this.sku = v; }
    public int getStock() { return stock; }
    public void setStock(int v) { this.stock = v; }
    public boolean isActive() { return active; }
    public void setActive(boolean v) { this.active = v; }
    public Map<String, String> getSelections() { return selections; }
    public void setSelections(Map<String, String> s) {
        this.selections.clear();
        this.selections.putAll(s);
    }
}
