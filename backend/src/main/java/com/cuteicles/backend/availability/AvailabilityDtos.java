package com.cuteicles.backend.availability;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Map;

public final class AvailabilityDtos {

    private AvailabilityDtos() {}

    /** weekly keys are "0".."6" (Sunday..Saturday); times are "HH:mm"; dates are "YYYY-MM-DD". */
    public record AvailabilityDto(
            Integer slotIntervalMin,
            @NotNull @Valid Map<String, DayDto> weekly,
            @Valid List<BreakDto> breaks,
            @Valid List<BlockedDto> blocked) {}

    public record DayDto(boolean open, String start, String end) {}

    public record BreakDto(String id, String label, String start, String end) {}

    public record BlockedDto(String id, String label, String start, String end) {}

    public record SlotDto(String time, boolean available, String reason) {}
}
