package com.cuteicles.backend.orders;

import com.cuteicles.backend.validation.IndianPhone;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public final class OrderDtos {

    private OrderDtos() {}

    public record ItemRequest(@NotBlank String productId, @NotBlank String variantId, @NotNull @Min(1) @Max(20) Integer qty) {}

    /** Name and email of the customer come from the session; only the phone is taken from the form. */
    public record CustomerInput(@IndianPhone String phone) {}

    public record ShippingInput(
            @NotBlank @Size(min = 2, max = 120) String name,
            @NotBlank @IndianPhone String phone,
            @NotBlank @Size(min = 3, max = 300) String street,
            @NotBlank @Size(min = 2, max = 150) String locality,
            @NotBlank @Size(min = 2, max = 100) String city,
            @NotBlank @Size(max = 100) String state,
            @NotBlank @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Enter a 6-digit PIN code.") String pin) {}

    /** items may be omitted to check out the server-side cart. */
    public record PlaceRequest(@Valid List<ItemRequest> items, @Valid CustomerInput customer,
                               @NotNull @Valid ShippingInput shipping, String paymentMethod) {}

    public record TrackingDto(@Size(max = 100) String carrier, @Size(max = 100) String number) {}

    public record UpdateRequest(String status, String paymentStatus, @Valid TrackingDto tracking,
                                @Size(max = 2000) String adminNote) {}

    public record CancelRequest(@Size(max = 500) String reason) {}

    public record CustomerDto(String name, String email, String phone) {}

    public record LineDto(String productId, String variantId, String name, String image, BigDecimal price, int qty,
                          Map<String, String> options) {}

    public record HistoryDto(String status, String at) {}

    public record Response(String id, String number, String userId, CustomerDto customer, List<LineDto> items,
                           ShippingInput shipping, BigDecimal subtotal, BigDecimal deliveryCharge, BigDecimal total,
                           String status, String paymentStatus, String paymentMethod, TrackingDto tracking,
                           String adminNote, String createdAt, List<HistoryDto> history) {}
}
