package com.cuteicles.backend.services;

import com.cuteicles.backend.appointments.AppointmentRepository;
import com.cuteicles.backend.common.ApiException;
import com.cuteicles.backend.common.Texts;
import com.cuteicles.backend.services.ServiceDtos.DeleteResult;
import com.cuteicles.backend.services.ServiceDtos.ServiceRequest;
import com.cuteicles.backend.services.ServiceDtos.ServiceResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class StudioServiceService {

    private final StudioServiceRepository repo;
    private final AppointmentRepository appointments;

    public StudioServiceService(StudioServiceRepository repo, AppointmentRepository appointments) {
        this.repo = repo;
        this.appointments = appointments;
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> listActive() {
        return repo.findByActiveTrueOrderByDisplayOrderAscIdAsc().stream().map(ServiceResponse::of).toList();
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> listAll() {
        return repo.findAllByOrderByDisplayOrderAscIdAsc().stream().map(ServiceResponse::of).toList();
    }

    /** Public lookups only return active services. */
    @Transactional(readOnly = true)
    public ServiceResponse getActive(String idOrSlug) {
        return ServiceResponse.of(findActive(idOrSlug));
    }

    @Transactional(readOnly = true)
    public ServiceResponse getBySlug(String slug) {
        return repo.findBySlug(slug).filter(StudioService::isActive).map(ServiceResponse::of)
                .orElseThrow(() -> ApiException.notFound("We could not find that service."));
    }

    @Transactional(readOnly = true)
    public ServiceResponse getAny(Long id) {
        return ServiceResponse.of(load(id));
    }

    @Transactional
    public ServiceResponse create(ServiceRequest in) {
        StudioService s = new StudioService();
        apply(s, in);
        s.setSlug(uniqueSlug(in.name(), null));
        return ServiceResponse.of(repo.save(s));
    }

    @Transactional
    public ServiceResponse update(Long id, ServiceRequest in) {
        StudioService s = load(id);
        apply(s, in);
        // The slug is kept on rename so existing links keep working.
        return ServiceResponse.of(repo.save(s));
    }

    @Transactional
    public ServiceResponse setActive(Long id, boolean active) {
        StudioService s = load(id);
        s.setActive(active);
        return ServiceResponse.of(repo.save(s));
    }

    /** A service that past appointments point to is switched off instead of deleted. */
    @Transactional
    public DeleteResult delete(Long id) {
        StudioService s = load(id);
        if (appointments.existsByServiceId(id)) {
            s.setActive(false);
            repo.save(s);
            return new DeleteResult(String.valueOf(id), false, true,
                    "This service has appointments on record, so it was deactivated instead of deleted.");
        }
        repo.delete(s);
        return new DeleteResult(String.valueOf(id), true, false, "Service deleted.");
    }

    // ---- helpers ----

    /** Used by booking: must exist and be active. */
    @Transactional(readOnly = true)
    public StudioService requireActive(Long id) {
        return repo.findById(id).filter(StudioService::isActive)
                .orElseThrow(() -> ApiException.conflict("That service is no longer available."));
    }

    private StudioService findActive(String idOrSlug) {
        Long id = Texts.parseId(idOrSlug);
        return (id != null ? repo.findById(id) : repo.findBySlug(idOrSlug))
                .filter(StudioService::isActive)
                .orElseThrow(() -> ApiException.notFound("We could not find that service."));
    }

    private StudioService load(Long id) {
        return repo.findById(id).orElseThrow(() -> ApiException.notFound("Service not found."));
    }

    private void apply(StudioService s, ServiceRequest in) {
        BigDecimal price = in.price();
        if (price != null && price.signum() < 0) {
            throw ApiException.invalid("price", "Enter a valid price, or leave blank.");
        }
        s.setName(in.name().trim());
        s.setCategory(Texts.trim(in.category()));
        s.setDescription(Texts.trim(in.description()));
        s.setDurationMin(in.durationMin());
        s.setPrice(price);
        String image = Texts.trim(in.image());
        s.setImageUrl(image.isEmpty() ? null : image);
        if (in.active() != null) s.setActive(in.active());
        if (in.order() != null) s.setDisplayOrder(in.order());
    }

    private String uniqueSlug(String name, Long selfId) {
        String base = Texts.slugify(name);
        if (base.isEmpty()) base = "service";
        String slug = base;
        int n = 2;
        while (repo.existsBySlug(slug)) {
            slug = base + "-" + n++;
        }
        return slug;
    }
}
