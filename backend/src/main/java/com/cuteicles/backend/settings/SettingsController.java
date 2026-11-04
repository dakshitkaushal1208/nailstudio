package com.cuteicles.backend.settings;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SettingsController {

    private final SettingsService settings;

    public SettingsController(SettingsService settings) {
        this.settings = settings;
    }

    /** Public: the website footer, policies and page wording. Contains no secrets. */
    @GetMapping("/api/settings")
    public SettingsDto publicSettings() {
        return settings.get();
    }

    @GetMapping("/api/admin/settings")
    public SettingsDto adminSettings() {
        return settings.get();
    }

    @PutMapping("/api/admin/settings")
    public SettingsDto update(@Valid @RequestBody SettingsDto body) {
        return settings.update(body);
    }
}
