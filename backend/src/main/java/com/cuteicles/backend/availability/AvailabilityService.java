package com.cuteicles.backend.availability;

import com.cuteicles.backend.appointments.Appointment;
import com.cuteicles.backend.appointments.AppointmentRepository;
import com.cuteicles.backend.appointments.AppointmentStatus;
import com.cuteicles.backend.availability.AvailabilityDtos.AvailabilityDto;
import com.cuteicles.backend.availability.AvailabilityDtos.BlockedDto;
import com.cuteicles.backend.availability.AvailabilityDtos.BreakDto;
import com.cuteicles.backend.availability.AvailabilityDtos.DayDto;
import com.cuteicles.backend.availability.AvailabilityDtos.SlotDto;
import com.cuteicles.backend.availability.AvailabilityRepositories.BlockedDateRepository;
import com.cuteicles.backend.availability.AvailabilityRepositories.StudioBreakRepository;
import com.cuteicles.backend.availability.AvailabilityRepositories.WorkingHoursRepository;
import com.cuteicles.backend.availability.SlotCalculator.Day;
import com.cuteicles.backend.availability.SlotCalculator.Range;
import com.cuteicles.backend.availability.SlotCalculator.Rules;
import com.cuteicles.backend.common.ApiException;
import com.cuteicles.backend.common.Texts;
import com.cuteicles.backend.services.StudioService;
import com.cuteicles.backend.services.StudioServiceRepository;
import com.cuteicles.backend.settings.SettingsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/** Turns the stored calendar (hours, breaks, closures) and existing bookings into days and time slots. */
@Service
public class AvailabilityService {

    private static final int MAX_RANGE_DAYS = 100;

    private final WorkingHoursRepository hours;
    private final StudioBreakRepository breaks;
    private final BlockedDateRepository blocked;
    private final AppointmentRepository appointments;
    private final StudioServiceRepository services;
    private final SettingsService settings;
    private final Clock clock;

    public AvailabilityService(WorkingHoursRepository hours, StudioBreakRepository breaks, BlockedDateRepository blocked,
                               AppointmentRepository appointments, StudioServiceRepository services,
                               SettingsService settings, Clock clock) {
        this.hours = hours;
        this.breaks = breaks;
        this.blocked = blocked;
        this.appointments = appointments;
        this.services = services;
        this.settings = settings;
        this.clock = clock;
    }

    /** The calendar as the slot calculator needs it. */
    public record Calendar(Map<Integer, WorkingHours> weekly, List<Range> breakRanges, List<BlockedDate> closures) {

        public Day dayFor(LocalDate date) {
            WorkingHours wh = weekly.get(dayIndex(date));
            if (wh == null || !wh.isOpen()) {
                return Day.closed();
            }
            boolean isBlocked = closures.stream().anyMatch(b -> b.covers(date));
            int open = wh.getStartTime().getHour() * 60 + wh.getStartTime().getMinute();
            int close = wh.getEndTime().getHour() * 60 + wh.getEndTime().getMinute();
            return new Day(true, open, close, breakRanges, isBlocked);
        }
    }

    /** 0 = Sunday ... 6 = Saturday. */
    public static int dayIndex(LocalDate date) {
        DayOfWeek d = date.getDayOfWeek();
        return d.getValue() % 7;
    }

    public LocalDateTime now() {
        return LocalDateTime.now(clock);
    }

    @Transactional(readOnly = true)
    public Calendar calendar() {
        Map<Integer, WorkingHours> weekly = new HashMap<>();
        hours.findAll().forEach(w -> weekly.put(w.getDayOfWeek(), w));
        List<Range> breakRanges = new ArrayList<>();
        breaks.findAll().forEach(b -> breakRanges.add(Range.of(b.getStartTime(), b.getEndTime())));
        return new Calendar(weekly, breakRanges, blocked.findAll());
    }

    public Rules slotRules() {
        SettingsService.Rules r = settings.rules();
        return new Rules(r.slotIntervalMin(), r.bufferMin(), r.minNoticeHours(), r.maxDaysAhead(), r.chairs());
    }

    /** Booked time ranges on a date: PENDING and APPROVED bookings occupy the calendar. */
    public static List<Range> rangesOf(List<Appointment> list) {
        List<Range> out = new ArrayList<>();
        for (Appointment a : list) {
            out.add(Range.of(a.getStartTime(), a.getEndTime()));
        }
        return out;
    }

    // ---------- public endpoints ----------

    @Transactional(readOnly = true)
    public Map<String, Boolean> days(String fromStr, String toStr) {
        LocalDate from = parseDate(fromStr, "from");
        LocalDate to = parseDate(toStr, "to");
        if (to.isBefore(from)) {
            throw ApiException.badRequest("\"to\" must not be before \"from\".");
        }
        if (from.plusDays(MAX_RANGE_DAYS).isBefore(to)) {
            throw ApiException.badRequest("Ask for at most " + MAX_RANGE_DAYS + " days at a time.");
        }
        Calendar cal = calendar();
        Rules rules = slotRules();
        LocalDateTime now = now();
        Integer shortest = services.shortestActiveDuration();
        int duration = shortest == null ? 60 : Math.min(shortest, 60);

        Map<LocalDate, List<Range>> bookedByDate = new HashMap<>();
        for (Appointment a : appointments.findOccupyingBetween(from, to, AppointmentStatus.OCCUPYING)) {
            bookedByDate.computeIfAbsent(a.getAppointmentDate(), k -> new ArrayList<>())
                    .add(Range.of(a.getStartTime(), a.getEndTime()));
        }

        Map<String, Boolean> out = new LinkedHashMap<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            out.put(d.toString(), SlotCalculator.dayOffered(d, duration, rules, cal.dayFor(d),
                    bookedByDate.getOrDefault(d, List.of()), now));
        }
        return out;
    }

    @Transactional(readOnly = true)
    public List<SlotDto> slots(String dateStr, String serviceIdStr) {
        LocalDate date = parseDate(dateStr, "date");
        Long serviceId = Texts.parseId(serviceIdStr);
        if (serviceId == null) {
            throw ApiException.badRequest("Please choose a service first.");
        }
        StudioService service = services.findById(serviceId).filter(StudioService::isActive)
                .orElseThrow(() -> ApiException.badRequest("Please choose a service first."));
        List<Range> booked = rangesOf(appointments.findOccupyingOn(date, AppointmentStatus.OCCUPYING));
        return SlotCalculator.slots(date, service.getDurationMin(), slotRules(), calendar().dayFor(date), booked, now())
                .stream().map(s -> new SlotDto(s.time(), s.available(), s.reason())).toList();
    }

    // ---------- admin: working hours, breaks, closures ----------

    @Transactional(readOnly = true)
    public AvailabilityDto get() {
        Map<String, DayDto> weekly = new TreeMap<>();
        for (int i = 0; i < 7; i++) {
            weekly.put(String.valueOf(i), new DayDto(false, "10:00", "19:00"));
        }
        hours.findAll().forEach(w -> weekly.put(String.valueOf(w.getDayOfWeek()),
                new DayDto(w.isOpen(), SlotCalculator.format(minutes(w.getStartTime())), SlotCalculator.format(minutes(w.getEndTime())))));
        List<BreakDto> breakList = breaks.findAll().stream()
                .map(b -> new BreakDto(String.valueOf(b.getId()), b.getLabel(),
                        SlotCalculator.format(minutes(b.getStartTime())), SlotCalculator.format(minutes(b.getEndTime()))))
                .toList();
        List<BlockedDto> blockedList = blocked.findAll().stream()
                .map(b -> new BlockedDto(String.valueOf(b.getId()), b.getLabel(), b.getStartDate().toString(), b.getEndDate().toString()))
                .toList();
        return new AvailabilityDto(settings.rules().slotIntervalMin(), weekly, breakList, blockedList);
    }

    @Transactional
    public AvailabilityDto save(AvailabilityDto in) {
        Map<String, String> errors = new LinkedHashMap<>();

        int interval = in.slotIntervalMin() == null ? settings.rules().slotIntervalMin() : in.slotIntervalMin();
        if (interval < 5 || interval > 240) {
            errors.put("slotIntervalMin", "Choose a slot length between 5 and 240 minutes.");
        }

        List<WorkingHours> newHours = new ArrayList<>();
        for (Map.Entry<String, DayDto> e : in.weekly().entrySet()) {
            Integer day = Texts.parseId(e.getKey()) == null ? null : Texts.parseId(e.getKey()).intValue();
            if (day == null || day < 0 || day > 6) {
                errors.put("weekly." + e.getKey(), "Days are numbered 0 (Sunday) to 6 (Saturday).");
                continue;
            }
            DayDto d = e.getValue();
            LocalTime start = parseTime(d.start());
            LocalTime end = parseTime(d.end());
            if (start == null || end == null) {
                errors.put("weekly." + day, "Enter opening and closing times as HH:mm.");
            } else if (d.open() && !start.isBefore(end)) {
                errors.put("weekly." + day, "Closing time must be after opening time.");
            } else {
                newHours.add(new WorkingHours(day, d.open(), start, end));
            }
        }

        List<StudioBreak> newBreaks = new ArrayList<>();
        for (BreakDto b : in.breaks() == null ? List.<BreakDto>of() : in.breaks()) {
            LocalTime s = parseTime(b.start());
            LocalTime en = parseTime(b.end());
            if (s == null || en == null || !s.isBefore(en)) {
                errors.put("breaks", "Each break needs a start time before its end time.");
            } else {
                newBreaks.add(new StudioBreak(Texts.trim(b.label()), s, en));
            }
        }

        List<BlockedDate> newBlocked = new ArrayList<>();
        for (BlockedDto b : in.blocked() == null ? List.<BlockedDto>of() : in.blocked()) {
            LocalDate s = tryDate(b.start());
            LocalDate en = tryDate(b.end());
            if (s == null || en == null || en.isBefore(s)) {
                errors.put("blocked", "Each closed period needs valid dates, with the end on or after the start.");
            } else {
                newBlocked.add(new BlockedDate(Texts.trim(b.label()), s, en));
            }
        }

        if (!errors.isEmpty()) {
            throw ApiException.invalid("Please fix the highlighted fields.", errors);
        }

        settings.setSlotInterval(interval);
        hours.deleteAll(hours.findAll());
        breaks.deleteAll(breaks.findAll());
        blocked.deleteAll(blocked.findAll());
        hours.flush();
        hours.saveAll(newHours);
        breaks.saveAll(newBreaks);
        blocked.saveAll(newBlocked);
        return get();
    }

    // ---------- parsing ----------

    private static int minutes(LocalTime t) {
        return t.getHour() * 60 + t.getMinute();
    }

    private static LocalDate parseDate(String s, String name) {
        LocalDate d = tryDate(s);
        if (d == null) {
            throw ApiException.badRequest("\"" + name + "\" must be a date like 2026-10-27.");
        }
        return d;
    }

    private static LocalDate tryDate(String s) {
        try {
            return s == null ? null : LocalDate.parse(s.trim());
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private static LocalTime parseTime(String s) {
        try {
            return s == null ? null : LocalTime.parse(s.trim());
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
