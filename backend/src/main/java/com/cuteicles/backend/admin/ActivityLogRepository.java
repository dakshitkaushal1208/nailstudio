package com.cuteicles.backend.admin;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    @Query("select a from ActivityLog a order by a.createdAt desc, a.id desc")
    List<ActivityLog> latest(Pageable pageable);
}
