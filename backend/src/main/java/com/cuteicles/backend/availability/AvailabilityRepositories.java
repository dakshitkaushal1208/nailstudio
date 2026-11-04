package com.cuteicles.backend.availability;

import org.springframework.data.jpa.repository.JpaRepository;

public final class AvailabilityRepositories {

    private AvailabilityRepositories() {}

    public interface WorkingHoursRepository extends JpaRepository<WorkingHours, Integer> {}

    public interface StudioBreakRepository extends JpaRepository<StudioBreak, Long> {}

    public interface BlockedDateRepository extends JpaRepository<BlockedDate, Long> {}
}
