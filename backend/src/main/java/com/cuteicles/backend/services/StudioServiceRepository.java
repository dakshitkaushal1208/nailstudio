package com.cuteicles.backend.services;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StudioServiceRepository extends JpaRepository<StudioService, Long> {

    List<StudioService> findByActiveTrueOrderByDisplayOrderAscIdAsc();

    List<StudioService> findAllByOrderByDisplayOrderAscIdAsc();

    Optional<StudioService> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query("select min(s.durationMin) from StudioService s where s.active = true")
    Integer shortestActiveDuration();
}
