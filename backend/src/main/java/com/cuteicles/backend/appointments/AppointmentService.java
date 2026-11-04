package com.cuteicles.backend.appointments;

import com.cuteicles.backend.admin.ActivityService;
import com.cuteicles.backend.appointments.AppointmentDtos.ContactDto;
import com.cuteicles.backend.appointments.AppointmentDtos.CreateRequest;
import com.cuteicles.backend.appointments.AppointmentDtos.Response;
import com.cuteicles.backend.availability.AvailabilityService;
import com.cuteicles.backend.availability.SlotCalculator;
import com.cuteicles.backend.availability.SlotCalculator.Range;
import com.cuteicles.backend.common.ApiException;
import com.cuteicles.backend.common.Texts;
import com.cuteicles.backend.notifications.Notifier;
import com.cuteicles.backend.security.AuthUser;
import com.cuteicles.backend.services.StudioService;
import com.cuteicles.backend.services.StudioServiceRepository;
import com.cuteicles.backend.settings.SettingsService;
import com.cuteicles.backend.settings.StudioSettingsRepository;
import com.cuteicles.backend.users.User;
import com.cuteicles.backend.users.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;

/**
 * Booking engine. Every write runs inside a transaction that first takes a pessimistic write
 * lock on the studio settings row, so two requests can never both pass the "is this slot free"
 * check for the same time. Identity always comes from the authenticated session.
 */
@Service
public class AppointmentService {

    private final AppointmentRepository appointments;
    private final AppointmentStatusHistoryRepository history;
    private final StudioServiceRepository services;
    private final StudioSettingsRepository settingsRepo;
    private final SettingsService settings;
    private final AvailabilityService availability;
    private final UserRepository users;
    private final Notifier notifier;
    private final ActivityService activity;
    private final Clock clock;

    public AppointmentService(AppointmentRepository appointments, AppointmentStatusHistoryRepository history,
                              StudioServiceRepository services, StudioSettingsRepository settingsRepo,
                              SettingsService settings, AvailabilityService availability, UserRepository users,
                              Notifier notifier, ActivityService activity, Clock clock) {
        this.appointments = appointments;
        this.history = history;
        this.services = services;
        this.settingsRepo = settingsRepo;
        this.settings = settings;
        this.availability = availability;
        this.users = users;
        this.notifier = notifier;
        this.activity = activity;
        this.clock = clock;
    }

    // ---------- customer ----------

    @Transactional
    public Response create(AuthUser caller, CreateRequest req) {
        Long serviceId = Texts.parseId(req.serviceId());
        LocalDate date = parseDate(req.date());
        LocalTime time = parseTime(req.time());
        if (serviceId == null || date == null || time == null) {
            throw ApiException.badRequest("Please choose a service, a date and a time.");
        }

        settingsRepo.lockForBooking(); // serialises all booking writes (see class comment)

        StudioService service = services.findById(serviceId).filter(StudioService::isActive)
                .orElseThrow(() -> ApiException.badRequest("That service is no longer available."));

        int startMin = time.getHour() * 60 + time.getMinute();
        List<Range> booked = AvailabilityService.rangesOf(appointments.findOccupyingOn(date, AppointmentStatus.OCCUPYING));
        String reason = SlotCalculator.reasonFor(date, startMin, service.getDurationMin(), availability.slotRules(),
                availability.calendar().dayFor(date), booked, availability.now());
        // The time must also be one of the offered slot starts, not just any minute that happens to be free.
        boolean offered = SlotCalculator.slots(date, service.getDurationMin(), availability.slotRules(),
                availability.calendar().dayFor(date), booked, availability.now())
                .stream().anyMatch(s -> s.time().equals(SlotCalculator.format(startMin)));
        if (reason != null || !offered) {
            throw ApiException.conflict("That time has just been taken. Please choose another.");
        }

        User user = users.findById(caller.id()).orElseThrow(() -> ApiException.unauthorized("Please sign in again."));
        ContactDto c = req.contact();
        String email = Texts.trim(c.email()).isEmpty() ? user.getEmail() : Texts.trim(c.email()).toLowerCase(Locale.ROOT);
        Instant now = clock.instant();
        LocalTime end = time.plusMinutes(service.getDurationMin());

        Appointment a = new Appointment(user.getId(), service.getId(), service.getName(), service.getPrice(),
                service.getDurationMin(), date, time, end, Texts.trim(c.name()), email,
                Texts.compactPhone(c.phone()), Texts.trim(req.notes()), now);
        appointments.save(a);
        history.save(new AppointmentStatusHistory(a.getId(), null, AppointmentStatus.PENDING, "Requested", user.getId(), now));
        activity.log("booking", "New booking request: " + a.getServiceName() + ", " + date + " " + time);
        notifier.bookingCreated(user.getId(), email, a.getCustomerName(), a.getServiceName(), whenText(a));
        return toResponse(a);
    }

    @Transactional(readOnly = true)
    public List<Response> listMine(AuthUser caller) {
        return appointments.findByUserIdOrderByAppointmentDateDescStartTimeDesc(caller.id())
                .stream().map(AppointmentService::toResponse).toList();
    }

    /** Someone else's booking looks exactly like a missing one (404), so ids can't be probed. */
    @Transactional(readOnly = true)
    public Response getMine(AuthUser caller, String idStr) {
        return toResponse(owned(caller, idStr));
    }

    @Transactional
    public Response cancel(AuthUser caller, String idStr, String reason) {
        Appointment a = owned(caller, idStr);
        settingsRepo.lockForBooking();
        a = appointments.findById(a.getId()).orElseThrow(() -> ApiException.notFound("We could not find that booking."));
        if (!a.getStatus().isOccupying()) {
            throw ApiException.conflict("This booking can no longer be cancelled.");
        }
        int cancelHours = settings.rules().cancelHoursBefore();
        LocalDateTime start = LocalDateTime.of(a.getAppointmentDate(), a.getStartTime());
        if (Duration.between(availability.now(), start).toMinutes() < cancelHours * 60L) {
            throw ApiException.conflict("Bookings can only be cancelled online at least " + cancelHours
                    + " hours before the appointment. Please contact the studio.");
        }
        applyStatus(a, AppointmentStatus.CANCELLED, Texts.trim(reason), caller.id());
        a.setCancellationReason(Texts.trim(reason));
        activity.log("booking", "Booking cancelled by customer: " + a.getServiceName() + ", " + a.getAppointmentDate());
        return toResponse(a);
    }

    // ---------- admin ----------

    @Transactional(readOnly = true)
    public List<Response> search(String status, String date) {
        AppointmentStatus st = null;
        if (status != null && !status.isBlank()) {
            st = parseStatus(status);
        }
        LocalDate d = null;
        if (date != null && !date.isBlank()) {
            d = parseDate(date);
            if (d == null) {
                throw ApiException.badRequest("\"date\" must look like 2026-10-27.");
            }
        }
        return appointments.search(st, d).stream().map(AppointmentService::toResponse).toList();
    }

    @Transactional
    public Response setStatus(AuthUser admin, String idStr, String statusStr, String note) {
        Long id = Texts.parseId(idStr);
        AppointmentStatus to = parseStatus(statusStr);
        settingsRepo.lockForBooking();
        Appointment a = (id == null ? java.util.Optional.<Appointment>empty() : appointments.findById(id))
                .orElseThrow(() -> ApiException.notFound("Appointment not found."));
        if (!a.getStatus().adminTargets().contains(to)) {
            throw ApiException.conflict("That change is not allowed for this appointment.");
        }
        String cleanNote = Texts.trim(note);
        if (!cleanNote.isEmpty()) {
            a.setAdminNote(cleanNote);
        }
        applyStatus(a, to, cleanNote, admin.id());
        activity.log("booking", a.getServiceName() + " (" + a.getAppointmentDate() + ") marked " + to.name().toLowerCase(Locale.ROOT));
        notifier.bookingStatus(a.getUserId(), a.getCustomerEmail(), a.getCustomerName(), a.getServiceName(),
                whenText(a), to.name(), a.getAdminNote());
        return toResponse(a);
    }

    // ---------- helpers ----------

    private Appointment owned(AuthUser caller, String idStr) {
        Long id = Texts.parseId(idStr);
        return (id == null ? java.util.Optional.<Appointment>empty() : appointments.findByIdAndUserId(id, caller.id()))
                .orElseThrow(() -> ApiException.notFound("We could not find that booking."));
    }

    private void applyStatus(Appointment a, AppointmentStatus to, String note, Long by) {
        Instant now = clock.instant();
        AppointmentStatus from = a.getStatus();
        a.changeStatus(to, now);
        history.save(new AppointmentStatusHistory(a.getId(), from, to, note, by, now));
    }

    private static String whenText(Appointment a) {
        return a.getAppointmentDate() + " at " + a.getStartTime();
    }

    private static AppointmentStatus parseStatus(String s) {
        try {
            return AppointmentStatus.valueOf(s.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException | NullPointerException e) {
            throw ApiException.badRequest("Unknown status.");
        }
    }

    private static LocalDate parseDate(String s) {
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

    public static Response toResponse(Appointment a) {
        return new Response(String.valueOf(a.getId()), String.valueOf(a.getServiceId()), a.getServiceName(),
                a.getDurationMin(), a.getPrice(), a.getAppointmentDate().toString(), hhmm(a.getStartTime()),
                hhmm(a.getEndTime()), a.getStatus().name(),
                new ContactDto(a.getCustomerName(), a.getCustomerPhone(), a.getCustomerEmail()),
                a.getNotes(), a.getAdminNote(), a.getCreatedAt().toString(), String.valueOf(a.getUserId()));
    }

    private static String hhmm(LocalTime t) {
        return SlotCalculator.format(t.getHour() * 60 + t.getMinute());
    }
}
