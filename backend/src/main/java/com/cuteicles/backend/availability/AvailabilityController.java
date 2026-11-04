package com.cuteicles.backend.availability;

import com.cuteicles.backend.availability.AvailabilityDtos.AvailabilityDto;
import com.cuteicles.backend.availability.AvailabilityDtos.SlotDto;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class AvailabilityController {

    private final AvailabilityService availability;

    public AvailabilityController(AvailabilityService availability) {
        this.availability = availability;
    }

    /** Public. Returns { "2026-10-27": true, ... }: true when the day can be booked. */
    @GetMapping("/api/availability/days")
    public Map<String, Boolean> days(@RequestParam String from, @RequestParam String to) {
        return availability.days(from, to);
    }

    /** Public. Returns [{ "time": "10:00", "available": true, "reason": "" }, ...]. */
    @GetMapping("/api/availability/slots")
    public List<SlotDto> slots(@RequestParam String date, @RequestParam String serviceId) {
        return availability.slots(date, serviceId);
    }

    @GetMapping("/api/admin/availability")
    public AvailabilityDto get() {
        return availability.get();
    }

    @PutMapping("/api/admin/availability")
    public AvailabilityDto save(@Valid @RequestBody AvailabilityDto body) {
        return availability.save(body);
    }
}
