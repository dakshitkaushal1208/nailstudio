package com.cuteicles.backend.appointments;

import com.cuteicles.backend.validation.IndianPhone;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public final class AppointmentDtos {

    private AppointmentDtos() {}

    public record ContactDto(
            @NotBlank @Size(max = 120) String name,
            @NotBlank @IndianPhone String phone,
            @Email @Size(max = 190) String email) {}

    /** The caller's identity comes from the session, never from this body. */
    public record CreateRequest(
            @NotBlank String serviceId,
            @NotBlank String date,
            @NotBlank String time,
            @NotNull @Valid ContactDto contact,
            @Size(max = 2000) String notes) {}

    public record StatusRequest(@NotBlank String status, @Size(max = 2000) String note, @Size(max = 2000) String adminNote) {
        public String effectiveNote() { return note != null ? note : adminNote; }
    }

    public record CancelRequest(@Size(max = 500) String reason) {}

    public record Response(
            String id,
            String serviceId,
            String serviceName,
            int durationMin,
            BigDecimal price,
            String date,
            String time,
            String endTime,
            String status,
            ContactDto contact,
            String notes,
            String adminNote,
            String createdAt,
            String userId) {}
}
