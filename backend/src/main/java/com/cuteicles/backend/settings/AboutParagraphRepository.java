package com.cuteicles.backend.settings;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AboutParagraphRepository extends JpaRepository<AboutParagraph, Long> {

    List<AboutParagraph> findAllByOrderByPositionAsc();
}
