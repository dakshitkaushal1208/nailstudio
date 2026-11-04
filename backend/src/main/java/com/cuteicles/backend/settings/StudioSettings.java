package com.cuteicles.backend.settings;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

/** The single settings row (id = 1). */
@Entity
@Table(name = "studio_settings")
public class StudioSettings {

    public static final long SINGLETON_ID = 1L;

    @Id
    private Long id = SINGLETON_ID;

    @Column(name = "studio_name", nullable = false, length = 150)
    private String studioName = "";
    @Column(nullable = false, length = 200)
    private String tagline = "";
    @Column(nullable = false, length = 40)
    private String phone = "";
    @Column(nullable = false, length = 190)
    private String email = "";
    @Column(nullable = false, length = 500)
    private String address = "";
    @Column(name = "map_url", nullable = false, length = 500)
    private String mapUrl = "";
    @Column(name = "service_area", nullable = false, length = 300)
    private String serviceArea = "";
    @Column(nullable = false, length = 300)
    private String instagram = "";
    @Column(nullable = false, length = 300)
    private String facebook = "";
    @Column(nullable = false, length = 300)
    private String whatsapp = "";
    @Column(name = "hours_note", nullable = false, length = 300)
    private String hoursNote = "";
    @Column(nullable = false, length = 3)
    private String currency = "INR";

    @Column(name = "slot_interval_min", nullable = false)
    private int slotIntervalMin = 30;
    @Column(name = "buffer_min", nullable = false)
    private int bufferMin = 0;
    @Column(name = "cancel_hours_before", nullable = false)
    private int cancelHoursBefore = 24;
    @Column(name = "min_notice_hours", nullable = false)
    private int minNoticeHours = 12;
    @Column(name = "max_days_ahead", nullable = false)
    private int maxDaysAhead = 60;
    @Column(nullable = false)
    private int chairs = 1;
    @Column(name = "booking_policy_text", nullable = false, length = 1000)
    private String bookingPolicyText = "";

    @Column(name = "delivery_charge", precision = 10, scale = 2)
    private BigDecimal deliveryCharge;
    @Column(name = "free_above", precision = 10, scale = 2)
    private BigDecimal freeAbove;
    @Column(name = "min_order_value", precision = 10, scale = 2)
    private BigDecimal minOrderValue;
    @Column(name = "delivery_text", nullable = false, length = 1000)
    private String deliveryText = "";

    @Column(name = "hero_title", nullable = false, length = 300)
    private String heroTitle = "";
    @Column(name = "hero_text", nullable = false, length = 600)
    private String heroText = "";
    @Column(name = "about_title", nullable = false, length = 300)
    private String aboutTitle = "";

    @Column(name = "notify_booking_email", nullable = false)
    private boolean notifyBookingEmail = true;
    @Column(name = "notify_order_email", nullable = false)
    private boolean notifyOrderEmail = true;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getStudioName() { return studioName; }
    public void setStudioName(String v) { this.studioName = v; }
    public String getTagline() { return tagline; }
    public void setTagline(String v) { this.tagline = v; }
    public String getPhone() { return phone; }
    public void setPhone(String v) { this.phone = v; }
    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }
    public String getAddress() { return address; }
    public void setAddress(String v) { this.address = v; }
    public String getMapUrl() { return mapUrl; }
    public void setMapUrl(String v) { this.mapUrl = v; }
    public String getServiceArea() { return serviceArea; }
    public void setServiceArea(String v) { this.serviceArea = v; }
    public String getInstagram() { return instagram; }
    public void setInstagram(String v) { this.instagram = v; }
    public String getFacebook() { return facebook; }
    public void setFacebook(String v) { this.facebook = v; }
    public String getWhatsapp() { return whatsapp; }
    public void setWhatsapp(String v) { this.whatsapp = v; }
    public String getHoursNote() { return hoursNote; }
    public void setHoursNote(String v) { this.hoursNote = v; }
    public String getCurrency() { return currency; }
    public void setCurrency(String v) { this.currency = v; }
    public int getSlotIntervalMin() { return slotIntervalMin; }
    public void setSlotIntervalMin(int v) { this.slotIntervalMin = v; }
    public int getBufferMin() { return bufferMin; }
    public void setBufferMin(int v) { this.bufferMin = v; }
    public int getCancelHoursBefore() { return cancelHoursBefore; }
    public void setCancelHoursBefore(int v) { this.cancelHoursBefore = v; }
    public int getMinNoticeHours() { return minNoticeHours; }
    public void setMinNoticeHours(int v) { this.minNoticeHours = v; }
    public int getMaxDaysAhead() { return maxDaysAhead; }
    public void setMaxDaysAhead(int v) { this.maxDaysAhead = v; }
    public int getChairs() { return chairs; }
    public void setChairs(int v) { this.chairs = v; }
    public String getBookingPolicyText() { return bookingPolicyText; }
    public void setBookingPolicyText(String v) { this.bookingPolicyText = v; }
    public BigDecimal getDeliveryCharge() { return deliveryCharge; }
    public void setDeliveryCharge(BigDecimal v) { this.deliveryCharge = v; }
    public BigDecimal getFreeAbove() { return freeAbove; }
    public void setFreeAbove(BigDecimal v) { this.freeAbove = v; }
    public BigDecimal getMinOrderValue() { return minOrderValue; }
    public void setMinOrderValue(BigDecimal v) { this.minOrderValue = v; }
    public String getDeliveryText() { return deliveryText; }
    public void setDeliveryText(String v) { this.deliveryText = v; }
    public String getHeroTitle() { return heroTitle; }
    public void setHeroTitle(String v) { this.heroTitle = v; }
    public String getHeroText() { return heroText; }
    public void setHeroText(String v) { this.heroText = v; }
    public String getAboutTitle() { return aboutTitle; }
    public void setAboutTitle(String v) { this.aboutTitle = v; }
    public boolean isNotifyBookingEmail() { return notifyBookingEmail; }
    public void setNotifyBookingEmail(boolean v) { this.notifyBookingEmail = v; }
    public boolean isNotifyOrderEmail() { return notifyOrderEmail; }
    public void setNotifyOrderEmail(boolean v) { this.notifyOrderEmail = v; }
}
