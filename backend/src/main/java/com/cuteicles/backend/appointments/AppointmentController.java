package com.cuteicles.backend.appointments;

import com.cuteicles.backend.appointments.AppointmentDtos.CancelRequest;
import com.cuteicles.backend.appointments.AppointmentDtos.CreateRequest;
import com.cuteicles.backend.appointments.AppointmentDtos.Response;
import com.cuteicles.backend.appointments.AppointmentDtos.StatusRequest;
import com.cuteicles.backend.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Customer routes need a session; admin routes are restricted to ADMIN in SecurityConfig. */
@RestController
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @PostMapping("/api/appointments")
    @ResponseStatus(HttpStatus.CREATED)
    public Response create(@Valid @RequestBody CreateRequest body) {
        return service.create(CurrentUser.require(), body);
    }

    @GetMapping("/api/appointments/my")
    public List<Response> mine() {
        return service.listMine(CurrentUser.require());
    }

    @GetMapping("/api/appointments/{id}")
    public Response one(@PathVariable String id) {
        return service.getMine(CurrentUser.require(), id);
    }

    @PostMapping("/api/appointments/{id}/cancel")
    public Response cancel(@PathVariable String id, @Valid @RequestBody(required = false) CancelRequest body) {
        return service.cancel(CurrentUser.require(), id, body == null ? null : body.reason());
    }

    @GetMapping("/api/admin/appointments")
    public List<Response> adminList(@RequestParam(required = false) String status,
                                    @RequestParam(required = false) String date) {
        return service.search(status, date);
    }

    @PatchMapping("/api/admin/appointments/{id}")
    public Response adminSetStatus(@PathVariable String id, @Valid @RequestBody StatusRequest body) {
        return service.setStatus(CurrentUser.require(), id, body.status(), body.effectiveNote());
    }
}
