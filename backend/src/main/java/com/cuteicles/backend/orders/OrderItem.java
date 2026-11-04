package com.cuteicles.backend.orders;

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

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

/** A line of an order: name, price and options are copied at purchase time. */
@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", insertable = false, updatable = false)
    private Long orderId;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "variant_id", nullable = false)
    private Long variantId;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl = "";

    @Column(nullable = false, length = 60)
    private String sku = "";

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private int quantity;

    @ElementCollection
    @CollectionTable(name = "order_item_options", joinColumns = @JoinColumn(name = "order_item_id"))
    @MapKeyColumn(name = "option_name")
    @Column(name = "option_value", nullable = false, length = 80)
    private Map<String, String> options = new LinkedHashMap<>();

    protected OrderItem() {}

    public OrderItem(Long productId, Long variantId, String productName, String imageUrl, String sku,
                     BigDecimal unitPrice, int quantity, Map<String, String> options) {
        this.productId = productId;
        this.variantId = variantId;
        this.productName = productName;
        this.imageUrl = imageUrl;
        this.sku = sku;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.options = new LinkedHashMap<>(options);
    }

    public Long getId() { return id; }
    public Long getProductId() { return productId; }
    public Long getVariantId() { return variantId; }
    public String getProductName() { return productName; }
    public String getImageUrl() { return imageUrl; }
    public String getSku() { return sku; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public int getQuantity() { return quantity; }
    public Map<String, String> getOptions() { return options; }
}
