package com.cuteicles.backend.notifications;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {

    long countByTypeAndStatus(String type, String status);
}
