package com.cuteicles.backend.admin;

import org.springframework.stereotype.Service;

@Service
public class ActivityService {

    private final ActivityLogRepository repo;

    public ActivityService(ActivityLogRepository repo) {
        this.repo = repo;
    }

    /** Joins the caller's transaction, so a rolled-back action leaves no trace. */
    public void log(String type, String text) {
        repo.save(new ActivityLog(type, text));
    }
}
