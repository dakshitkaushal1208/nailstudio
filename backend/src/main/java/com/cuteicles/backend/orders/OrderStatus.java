package com.cuteicles.backend.orders;

import java.util.EnumSet;
import java.util.Set;

/**
 * Names follow the current frontend. Mapping to the product brief's vocabulary:
 * PLACED = pending, CONFIRMED = confirmed, PACKING = processing, DISPATCHED = shipped,
 * DELIVERED = delivered, CANCELLED = cancelled, REJECTED = declined by the studio.
 */
public enum OrderStatus {
    PLACED, CONFIRMED, REJECTED, PACKING, DISPATCHED, DELIVERED, CANCELLED;

    public Set<OrderStatus> targets() {
        return switch (this) {
            case PLACED -> EnumSet.of(CONFIRMED, REJECTED, CANCELLED);
            case CONFIRMED -> EnumSet.of(PACKING, CANCELLED);
            case PACKING -> EnumSet.of(DISPATCHED, CANCELLED);
            case DISPATCHED -> EnumSet.of(DELIVERED);
            default -> EnumSet.noneOf(OrderStatus.class);
        };
    }

    /** Statuses whose stock goes back on the shelf. */
    public boolean releasesStock() {
        return this == REJECTED || this == CANCELLED;
    }
}
