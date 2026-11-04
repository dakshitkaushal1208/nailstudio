package com.cuteicles.backend.availability;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalTime;

@Entity
@Table(name = "studio_breaks")
public class StudioBreak {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String label = "";

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    protected StudioBreak() {}

    public StudioBreak(String label, LocalTime startTime, LocalTime endTime) {
        this.label = label;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Long getId() { return id; }
    public String getLabel() { return label; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
}
