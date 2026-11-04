package com.cuteicles.backend.products;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public final class ProductDtos {

    private ProductDtos() {}

    public record OptionDto(@NotBlank @Size(max = 60) String name, @NotNull List<String> values) {}

    public record VariantDto(String id, Map<String, String> options, Integer stock, @Size(max = 60) String sku, Boolean active) {}

    public record Request(
            @NotBlank @Size(max = 200) String name,
            @Size(max = 220) String slug,
            @Size(max = 4000) String description,
            @Size(max = 80) String category,
            @NotNull BigDecimal price,
            BigDecimal compareAtPrice,
            @Size(max = 60) String sku,
            Boolean featured,
            Boolean active,
            List<String> images,
            List<String> details,
            @Valid List<OptionDto> options,
            @Valid List<VariantDto> variants) {}

    public record VariantResponse(String id, Map<String, String> options, int stock, String sku, boolean active) {}

    public record Response(String id, String slug, String name, String category, BigDecimal price,
                           BigDecimal compareAtPrice, String description, List<String> details, List<String> images,
                           List<OptionDto> options, List<VariantResponse> variants, boolean active, boolean featured,
                           String createdAt) {}

    public record ActiveRequest(@NotNull Boolean active) {}

    public record AdjustRequest(@NotNull Integer delta, @Size(max = 200) String reason) {}
}
