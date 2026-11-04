package com.cuteicles.backend.orders;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", length = 30)
    private String orderNumber;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "customer_name", nullable = false) private String customerName;
    @Column(name = "customer_email", nullable = false) private String customerEmail;
    @Column(name = "customer_phone", nullable = false) private String customerPhone;

    @Column(name = "ship_name", nullable = false) private String shipName;
    @Column(name = "ship_phone", nullable = false) private String shipPhone;
    @Column(name = "ship_street", nullable = false, length = 300) private String shipStreet;
    @Column(name = "ship_locality", nullable = false, length = 150) private String shipLocality;
    @Column(name = "ship_city", nullable = false, length = 100) private String shipCity;
    @Column(name = "ship_state", nullable = false, length = 100) private String shipState;
    @Column(name = "ship_pin", nullable = false, length = 10) private String shipPin;

    @Column(nullable = false) private BigDecimal subtotal;
    @Column(name = "delivery_fee") private BigDecimal deliveryFee;
    @Column(nullable = false) private BigDecimal discount = BigDecimal.ZERO;
    @Column(nullable = false) private BigDecimal total;

    @Column(name = "payment_method", nullable = false, length = 20) private String paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.PLACED;

    @Column(name = "tracking_carrier", nullable = false, length = 100) private String trackingCarrier = "";
    @Column(name = "tracking_number", nullable = false, length = 100) private String trackingNumber = "";
    @Column(name = "admin_note", nullable = false, length = 2000) private String adminNote = "";
    @Column(name = "idem_key", length = 80) private String idemKey;

    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_id", nullable = false)
    @OrderBy("id asc")
    private List<OrderItem> items = new ArrayList<>();

    protected CustomerOrder() {}

    public CustomerOrder(Long userId, Instant now) {
        this.userId = userId;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void setCustomer(String name, String email, String phone) {
        this.customerName = name;
        this.customerEmail = email;
        this.customerPhone = phone;
    }

    public void setShipping(String name, String phone, String street, String locality, String city, String state, String pin) {
        this.shipName = name;
        this.shipPhone = phone;
        this.shipStreet = street;
        this.shipLocality = locality;
        this.shipCity = city;
        this.shipState = state;
        this.shipPin = pin;
    }

    public void setAmounts(BigDecimal subtotal, BigDecimal deliveryFee, BigDecimal total) {
        this.subtotal = subtotal;
        this.deliveryFee = deliveryFee;
        this.total = total;
    }

    public void touch(Instant now) { this.updatedAt = now; }

    public Long getId() { return id; }
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String v) { this.orderNumber = v; }
    public Long getUserId() { return userId; }
    public String getCustomerName() { return customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public String getCustomerPhone() { return customerPhone; }
    public String getShipName() { return shipName; }
    public String getShipPhone() { return shipPhone; }
    public String getShipStreet() { return shipStreet; }
    public String getShipLocality() { return shipLocality; }
    public String getShipCity() { return shipCity; }
    public String getShipState() { return shipState; }
    public String getShipPin() { return shipPin; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getDeliveryFee() { return deliveryFee; }
    public BigDecimal getTotal() { return total; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String v) { this.paymentMethod = v; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus v) { this.paymentStatus = v; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus v) { this.status = v; }
    public String getTrackingCarrier() { return trackingCarrier; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTracking(String carrier, String number) { this.trackingCarrier = carrier; this.trackingNumber = number; }
    public String getAdminNote() { return adminNote; }
    public void setAdminNote(String v) { this.adminNote = v; }
    public String getIdemKey() { return idemKey; }
    public void setIdemKey(String v) { this.idemKey = v; }
    public Instant getCreatedAt() { return createdAt; }
    public List<OrderItem> getItems() { return items; }
}
