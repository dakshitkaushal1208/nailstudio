package com.cuteicles.backend.services;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public final class ServiceDtos {

    private ServiceDtos() {}

    /** Same field names the frontend uses ("image", "order"). */
    public record ServiceResponse(
            String id, String name, String slug, String category, String description,
            int durationMin, BigDecimal price, String image, boolean active, int order) {

        public static ServiceResponse of(StudioService s) {
            return new ServiceResponse(String.valueOf(s.getId()), s.getName(), s.getSlug(), s.getCategory(),
                    s.getDescription(), s.getDurationMin(), s.getPrice(), s.getImageUrl(), s.isActive(), s.getDisplayOrder());
        }
    }

    public record ServiceRequest(
            @NotBlank(message = "Give the service a name.") @Size(min = 2, max = 150, message = "Give the service a name.") String name,
            @Size(max = 80) String category,
            @Size(max = 2000) String description,
            @Min(value = 15, message = "Duration must be at least 15 minutes.") @Max(value = 720, message = "Duration cannot be more than 12 hours.") int durationMin,
            BigDecimal price,
            @Size(max = 500) String image,
            Boolean active,
            Integer order) {}

    public record StatusRequest(Boolean active) {}

    public record DeleteResult(String id, boolean deleted, boolean deactivated, String message) {}
}
