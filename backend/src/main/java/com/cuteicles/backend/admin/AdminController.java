package com.cuteicles.backend.admin;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AdminController {

    private final AdminOverviewService overview;

    public AdminController(AdminOverviewService overview) {
        this.overview = overview;
    }

    /** ADMIN only (SecurityConfig: /api/admin/**). */
    @GetMapping("/api/admin/overview")
    public AdminOverviewService.Overview overview() {
        return overview.overview();
    }
}
