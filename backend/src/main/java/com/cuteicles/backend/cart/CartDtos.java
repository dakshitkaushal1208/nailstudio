package com.cuteicles.backend.cart;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public final class CartDtos {

    private CartDtos() {}

    /** quantity 0 removes the line. */
    public record SetItemRequest(@NotBlank String variantId, @NotNull @Min(0) @Max(20) Integer quantity) {}

    public record Line(String productId, String variantId, String name, String image, BigDecimal price, int qty,
                       Map<String, String> options, int stock, boolean available) {}

    public record CartResponse(List<Line> lines, BigDecimal subtotal) {}
}
