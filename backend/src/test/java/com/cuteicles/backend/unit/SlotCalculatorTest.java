package com.cuteicles.backend.unit;

import com.cuteicles.backend.availability.SlotCalculator;
import com.cuteicles.backend.availability.SlotCalculator.Day;
import com.cuteicles.backend.availability.SlotCalculator.Range;
import com.cuteicles.backend.availability.SlotCalculator.Rules;
import com.cuteicles.backend.availability.SlotCalculator.Slot;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SlotCalculatorTest {

    private final LocalDate tuesday = LocalDate.of(2026, 10, 27);
    private final LocalDateTime now = LocalDateTime.of(2026, 10, 19, 9, 0);
    private final Day day = new Day(true, 600, 1140, List.of(new Range(810, 870)), false);

    private static String reason(List<Slot> slots, String time) {
        return slots.stream().filter(s -> s.time().equals(time)).findFirst().orElseThrow().reason();
    }

    @Test
    void firstAndLastSlotsFollowOpeningHours() {
        var s = SlotCalculator.slots(tuesday, 60, new Rules(30, 0, 12, 60, 1), day, List.of(), now);
        assertEquals("10:00", s.get(0).time());
        assertEquals("18:00", s.get(s.size() - 1).time());
    }

    @Test
    void studioBreakBlocksOverlappingStarts() {
        var s = SlotCalculator.slots(tuesday, 60, new Rules(30, 0, 12, 60, 1), day, List.of(), now);
        assertEquals("Studio break", reason(s, "13:00"));
        assertEquals("", reason(s, "14:30") == null ? "" : reason(s, "14:30"));
    }

    @Test
    void existingBookingBlocksOverlapButNotAdjacentSlots() {
        var s = SlotCalculator.slots(tuesday, 60, new Rules(30, 0, 12, 60, 1), day, List.of(new Range(660, 720)), now);
        assertEquals("Booked", reason(s, "10:30"));
        assertEquals("Booked", reason(s, "11:30"));
    }

    @Test
    void bufferAndChairsAreRespected() {
        var buffered = SlotCalculator.slots(tuesday, 60, new Rules(30, 30, 12, 60, 1), day, List.of(new Range(660, 720)), now);
        assertEquals("Booked", reason(buffered, "10:00"));
        var twoChairs = SlotCalculator.slots(tuesday, 60, new Rules(30, 0, 12, 60, 2), day,
                List.of(new Range(660, 720), new Range(690, 750)), now);
        assertEquals("Booked", reason(twoChairs, "11:30"));
    }

    @Test
    void closedAndBlockedDaysOfferNothing() {
        assertEquals(false, SlotCalculator.dayOffered(tuesday, 60, new Rules(30, 0, 12, 60, 1), Day.closed(), List.of(), now));
    }
}
