package com.cuteicles.backend.appointments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    boolean existsByServiceId(Long serviceId);

    List<Appointment> findByUserIdOrderByAppointmentDateDescStartTimeDesc(Long userId);

    Optional<Appointment> findByIdAndUserId(Long id, Long userId);

    @Query("select a from Appointment a where a.appointmentDate = :date and a.status in :statuses")
    List<Appointment> findOccupyingOn(@Param("date") LocalDate date,
                                      @Param("statuses") Collection<AppointmentStatus> statuses);

    @Query("select a from Appointment a where a.appointmentDate between :from and :to and a.status in :statuses")
    List<Appointment> findOccupyingBetween(@Param("from") LocalDate from, @Param("to") LocalDate to,
                                           @Param("statuses") Collection<AppointmentStatus> statuses);

    @Query("""
           select a from Appointment a
           where (:status is null or a.status = :status)
             and (:date is null or a.appointmentDate = :date)
           order by a.appointmentDate desc, a.startTime desc
           """)
    List<Appointment> search(@Param("status") AppointmentStatus status, @Param("date") LocalDate date);

    long countByStatus(AppointmentStatus status);

    @Query("select a from Appointment a where a.appointmentDate = :date and a.status in :statuses order by a.startTime")
    List<Appointment> findForDay(@Param("date") LocalDate date, @Param("statuses") Collection<AppointmentStatus> statuses);
}
