package com.cuteicles.backend.orders;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Pure money rules. Prices always come from the catalogue, never from the client. */
public final class OrderPricing {

    private OrderPricing() {}

    public static BigDecimal lineTotal(BigDecimal unitPrice, int qty) {
        return unitPrice.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Delivery fee. null means "the studio has not set a charge; it will be confirmed",
     * zero means free (subtotal reached the free-delivery threshold).
     */
    public static BigDecimal delivery(BigDecimal subtotal, BigDecimal charge, BigDecimal freeAbove) {
        if (charge == null || charge.signum() < 0) {
            return null;
        }
        if (freeAbove != null && freeAbove.signum() > 0 && subtotal.compareTo(freeAbove) >= 0) {
            return BigDecimal.ZERO.setScale(2);
        }
        return charge.setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal total(BigDecimal subtotal, BigDecimal deliveryOrNull) {
        return subtotal.add(deliveryOrNull == null ? BigDecimal.ZERO : deliveryOrNull).setScale(2, RoundingMode.HALF_UP);
    }
}
