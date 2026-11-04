package com.cuteicles.backend.settings;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface StudioSettingsRepository extends JpaRepository<StudioSettings, Long> {

    /**
     * Takes a database write lock on the settings row. Bookings call this first, so two requests that
     * race for the same time are processed one after the other and the second sees the first.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from StudioSettings s where s.id = 1")
    StudioSettings lockForBooking();
}
