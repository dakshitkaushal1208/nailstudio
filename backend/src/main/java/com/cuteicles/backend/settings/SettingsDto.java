package com.cuteicles.backend.settings;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

/**
 * Same nested shape the frontend uses. On update, a missing (null) section is left unchanged.
 */
public record SettingsDto(
        @NotBlank(message = "The studio needs a name.") @Size(max = 150) String studioName,
        @Size(max = 200) String tagline,
        @Valid Contact contact,
        @Valid Social social,
        @Size(max = 300) String hoursNote,
        @Size(max = 300) String serviceArea,
        @Size(min = 3, max = 3) String currency,
        @Valid BookingPolicy bookingPolicy,
        @Valid DeliveryPolicy deliveryPolicy,
        @Valid Copy copy,
        Notifications notifications) {

    public record Contact(
            @Size(max = 40) String phone,
            @Size(max = 190) String email,
            @Size(max = 500) String address,
            @Size(max = 500) String mapUrl) {}

    public record Social(
            @Size(max = 300) String instagram,
            @Size(max = 300) String facebook,
            @Size(max = 300) String whatsapp) {}

    public record BookingPolicy(
            Integer cancelHoursBefore,
            Integer minNoticeHours,
            Integer maxDaysAhead,
            Integer chairs,
            Integer bufferMin,
            @Size(max = 1000) String text) {}

    /** charge null means "the studio confirms the delivery charge after the order". */
    public record DeliveryPolicy(
            BigDecimal charge,
            BigDecimal freeAbove,
            BigDecimal minOrderValue,
            @Size(max = 1000) String text) {}

    public record Copy(
            @Size(max = 300) String heroTitle,
            @Size(max = 600) String heroText,
            @Size(max = 300) String aboutTitle,
            List<String> aboutParagraphs) {}

    public record Notifications(Boolean bookingEmail, Boolean orderEmail) {}
}
