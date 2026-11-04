package com.cuteicles.backend.availability;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

/** A holiday or closure covering start..end inclusive. */
@Entity
@Table(name = "blocked_dates")
public class BlockedDate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String label = "";

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    protected BlockedDate() {}

    public BlockedDate(String label, LocalDate startDate, LocalDate endDate) {
        this.label = label;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Long getId() { return id; }
    public String getLabel() { return label; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }

    public boolean covers(LocalDate d) {
        return !d.isBefore(startDate) && !d.isAfter(endDate);
    }
}
