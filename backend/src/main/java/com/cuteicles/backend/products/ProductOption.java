package com.cuteicles.backend.products;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

/** One choice axis of a product (for example Shape) and its allowed values. */
@Entity
@Table(name = "product_options")
public class ProductOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", insertable = false, updatable = false)
    private Long productId;

    @Column(nullable = false, length = 60)
    private String name;

    @Column(nullable = false)
    private int position;

    @ElementCollection
    @CollectionTable(name = "product_option_values", joinColumns = @JoinColumn(name = "option_id"))
    @Column(name = "option_value", nullable = false, length = 80)
    @OrderColumn(name = "position")
    private List<String> values = new ArrayList<>();

    protected ProductOption() {}

    public ProductOption(String name, int position, List<String> values) {
        this.name = name;
        this.position = position;
        this.values = new ArrayList<>(values);
    }


    public Long getId() { return id; }
    public Long getProductId() { return productId; }
    public String getName() { return name; }
    public int getPosition() { return position; }
    public List<String> getValues() { return values; }
}
