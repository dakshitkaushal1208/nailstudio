package com.cuteicles.backend.products;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 220)
    private String slug;

    @Column(nullable = false, length = 4000)
    private String description = "";

    @Column(nullable = false, length = 80)
    private String category = "";

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "compare_at_price")
    private BigDecimal compareAtPrice;

    @Column(nullable = false, length = 60)
    private String sku = "";

    @Column(nullable = false)
    private boolean featured;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "url", nullable = false, length = 500)
    @OrderColumn(name = "position")
    private List<String> images = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "product_details", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "body", nullable = false, length = 300)
    @OrderColumn(name = "position")
    private List<String> details = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "product_id", nullable = false)
    @OrderBy("position asc")
    private List<ProductOption> options = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "product_id", nullable = false)
    @OrderBy("id asc")
    private List<ProductVariant> variants = new ArrayList<>();

    protected Product() {}

    public Product(Instant now) {
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void touch(Instant now) { this.updatedAt = now; }

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
    public BigDecimal getCompareAtPrice() { return compareAtPrice; }
    public void setCompareAtPrice(BigDecimal v) { this.compareAtPrice = v; }
    public String getSku() { return sku; }
    public void setSku(String v) { this.sku = v; }
    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean v) { this.featured = v; }
    public boolean isActive() { return active; }
    public void setActive(boolean v) { this.active = v; }
    public Instant getCreatedAt() { return createdAt; }
    public List<String> getImages() { return images; }
    public List<String> getDetails() { return details; }
    public List<ProductOption> getOptions() { return options; }
    public List<ProductVariant> getVariants() { return variants; }
}
