package com.cuteicles.backend.appointments;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentStatusHistoryRepository extends JpaRepository<AppointmentStatusHistory, Long> {}
