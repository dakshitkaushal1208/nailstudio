package com.cuteicles.backend.services;

import com.cuteicles.backend.common.ApiException;
import com.cuteicles.backend.common.Texts;
import com.cuteicles.backend.services.ServiceDtos.DeleteResult;
import com.cuteicles.backend.services.ServiceDtos.ServiceRequest;
import com.cuteicles.backend.services.ServiceDtos.ServiceResponse;
import com.cuteicles.backend.services.ServiceDtos.StatusRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;

@RestController
public class ServiceController {

    private final StudioServiceService services;

    public ServiceController(StudioServiceService services) {
        this.services = services;
    }

    // ---- public: active services only ----

    @GetMapping("/api/services")
    public List<ServiceResponse> list() {
        return services.listActive();
    }

    @GetMapping("/api/services/slug/{slug}")
    public ServiceResponse bySlug(@PathVariable String slug) {
        return services.getBySlug(slug);
    }

    @GetMapping("/api/services/{id}")
    public ServiceResponse get(@PathVariable String id) {
        return services.getActive(id);
    }

    // ---- admin (ADMIN role enforced in SecurityConfig) ----

    @GetMapping("/api/admin/services")
    public List<ServiceResponse> adminList() {
        return services.listAll();
    }

    @GetMapping("/api/admin/services/{id}")
    public ServiceResponse adminGet(@PathVariable String id) {
        return services.getAny(requireId(id));
    }

    @PostMapping("/api/admin/services")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceResponse create(@Valid @RequestBody ServiceRequest body) {
        return services.create(body);
    }

    @PutMapping("/api/admin/services/{id}")
    public ServiceResponse update(@PathVariable String id, @Valid @RequestBody ServiceRequest body) {
        return services.update(requireId(id), body);
    }

    @PatchMapping("/api/admin/services/{id}/status")
    public ServiceResponse status(@PathVariable String id, @RequestBody StatusRequest body) {
        if (body.active() == null) {
            throw ApiException.badRequest("Send { \"active\": true } or { \"active\": false }.");
        }
        return services.setActive(requireId(id), body.active());
    }

    @DeleteMapping("/api/admin/services/{id}")
    public DeleteResult delete(@PathVariable String id) {
        return services.delete(requireId(id));
    }

    private static Long requireId(String id) {
        Long parsed = Texts.parseId(id);
        if (parsed == null) throw ApiException.notFound("Service not found.");
        return parsed;
    }
}
