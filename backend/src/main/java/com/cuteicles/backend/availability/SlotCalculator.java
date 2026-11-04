package com.cuteicles.backend.availability;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Pure booking arithmetic: no database, no Spring. Everything about "can this time be booked" lives here
 * so it can be tested on its own and shared by the availability endpoints and the booking transaction.
 * Times are minutes since midnight.
 */
public final class SlotCalculator {

    private SlotCalculator() {}

    public record Rules(int slotIntervalMin, int bufferMin, int minNoticeHours, int maxDaysAhead, int chairs) {}

    /** A half-open range [start, end) in minutes since midnight. */
    public record Range(int start, int end) {
        public static Range of(LocalTime start, LocalTime end) {
            return new Range(start.getHour() * 60 + start.getMinute(), end.getHour() * 60 + end.getMinute());
        }
    }

    /** What the studio's calendar says about one date. */
    public record Day(boolean open, int openMin, int closeMin, List<Range> breaks, boolean blocked) {
        public static Day closed() {
            return new Day(false, 0, 0, List.of(), false);
        }
    }

    public record Slot(String time, boolean available, String reason) {}

    public static String format(int minutes) {
        return String.format("%02d:%02d", minutes / 60, minutes % 60);
    }

    /** Every start time the day could have for a service of this length, each marked available or not (with a reason). */
    public static List<Slot> slots(LocalDate date, int durationMin, Rules rules, Day day, List<Range> booked, LocalDateTime now) {
        List<Slot> out = new ArrayList<>();
        if (day == null || !day.open() || day.blocked() || durationMin <= 0 || rules.slotIntervalMin() <= 0) {
            return out;
        }
        for (int t = day.openMin(); t + durationMin <= day.closeMin(); t += rules.slotIntervalMin()) {
            String reason = reasonFor(date, t, durationMin, rules, day, booked, now);
            out.add(new Slot(format(t), reason == null, reason == null ? "" : reason));
        }
        return out;
    }

    /** Null when the time can be booked, otherwise the short reason shown to the customer. */
    public static String reasonFor(LocalDate date, int startMin, int durationMin, Rules rules, Day day,
                                   List<Range> booked, LocalDateTime now) {
        if (day == null || !day.open() || day.blocked()) {
            return "Closed";
        }
        int end = startMin + durationMin;
        if (startMin < day.openMin() || end > day.closeMin()) {
            return "Outside opening hours";
        }
        LocalDate today = now.toLocalDate();
        if (date.isBefore(today)) {
            return "Past";
        }
        if (date.isAfter(today.plusDays(rules.maxDaysAhead()))) {
            return "Too far ahead";
        }
        LocalDateTime startsAt = date.atTime(startMin / 60, startMin % 60);
        if (startsAt.isBefore(now.plusHours(rules.minNoticeHours()))) {
            return "Too soon";
        }
        for (Range b : day.breaks()) {
            if (startMin < b.end() && b.start() < end) {
                return "Studio break";
            }
        }
        if (!fits(startMin, end, rules.bufferMin(), Math.max(1, rules.chairs()), booked)) {
            return "Booked";
        }
        return null;
    }

    /**
     * True if a new booking [start, end) can be added without ever needing more than "chairs" chairs at once.
     * The buffer is a quiet gap kept after every appointment: each one is treated as lasting "buffer" minutes longer.
     */
    public static boolean fits(int start, int end, int buffer, int chairs, List<Range> booked) {
        int newEnd = end + buffer;
        List<Range> conflicting = new ArrayList<>();
        for (Range b : booked) {
            int bEnd = b.end() + buffer;
            if (start < bEnd && b.start() < newEnd) {
                conflicting.add(new Range(b.start(), bEnd));
            }
        }
        if (conflicting.isEmpty()) {
            return true;
        }
        // Concurrency only increases at a start time, so checking the new start and each conflicting start is enough.
        List<Integer> points = new ArrayList<>();
        points.add(start);
        for (Range c : conflicting) {
            if (c.start() > start) {
                points.add(c.start());
            }
        }
        for (int p : points) {
            int count = 0;
            for (Range c : conflicting) {
                if (c.start() <= p && p < c.end()) {
                    count++;
                }
            }
            if (count + 1 > chairs) {
                return false;
            }
        }
        return true;
    }

    /** A date is offered if it is within range, the studio is open, and at least one start time is free. */
    public static boolean dayOffered(LocalDate date, int shortestDurationMin, Rules rules, Day day,
                                     List<Range> booked, LocalDateTime now) {
        LocalDate today = now.toLocalDate();
        if (date.isBefore(today) || date.isAfter(today.plusDays(rules.maxDaysAhead()))) {
            return false;
        }
        return slots(date, shortestDurationMin, rules, day, booked, now).stream().anyMatch(Slot::available);
    }
}
