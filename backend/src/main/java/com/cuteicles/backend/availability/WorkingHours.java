package com.cuteicles.backend.availability;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalTime;

/** Opening hours for one weekday. day_of_week: 0 = Sunday ... 6 = Saturday (as in the frontend). */
@Entity
@Table(name = "working_hours")
public class WorkingHours {

    @Id
    @Column(name = "day_of_week")
    private Integer dayOfWeek;

    @Column(name = "is_open", nullable = false)
    private boolean open;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    protected WorkingHours() {}

    public WorkingHours(Integer dayOfWeek, boolean open, LocalTime startTime, LocalTime endTime) {
        this.dayOfWeek = dayOfWeek;
        this.open = open;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Integer getDayOfWeek() { return dayOfWeek; }
    public boolean isOpen() { return open; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
}
