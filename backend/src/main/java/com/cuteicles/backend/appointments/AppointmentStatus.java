package com.cuteicles.backend.appointments;

import java.util.EnumSet;
import java.util.Set;

public enum AppointmentStatus {
    PENDING, APPROVED, REJECTED, CANCELLED, COMPLETED;

    /** Statuses that hold a place in the calendar. */
    public static final Set<AppointmentStatus> OCCUPYING = EnumSet.of(PENDING, APPROVED);

    /** Moves the studio owner may make. Customers may only cancel (PENDING or APPROVED -> CANCELLED). */
    public Set<AppointmentStatus> adminTargets() {
        return switch (this) {
            case PENDING -> EnumSet.of(APPROVED, REJECTED, CANCELLED);
            case APPROVED -> EnumSet.of(COMPLETED, CANCELLED);
            default -> EnumSet.noneOf(AppointmentStatus.class);
        };
    }

    public boolean isOccupying() {
        return OCCUPYING.contains(this);
    }
}
