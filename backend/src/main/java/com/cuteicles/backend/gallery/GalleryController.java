package com.cuteicles.backend.gallery;

import com.cuteicles.backend.gallery.GalleryDtos.ReorderRequest;
import com.cuteicles.backend.gallery.GalleryDtos.Request;
import com.cuteicles.backend.gallery.GalleryDtos.Response;
import com.cuteicles.backend.gallery.GalleryDtos.UploadResponse;
import com.cuteicles.backend.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Public reads at /api/gallery. Writes are ADMIN-only (SecurityConfig): the canonical routes are
 * /api/admin/gallery*, and the /api/gallery* write routes exist because the current frontend calls them.
 */
@RestController
public class GalleryController {

    private final GalleryService gallery;

    public GalleryController(GalleryService gallery) {
        this.gallery = gallery;
    }

    /** Visitors see published items; an ADMIN session also sees hidden ones (the admin screen lists from here). */
    @GetMapping("/api/gallery")
    public List<Response> list() {
        return gallery.list(CurrentUser.isAdmin());
    }

    @GetMapping("/api/gallery/categories")
    public List<String> categories() {
        return gallery.categoryNames();
    }

    @GetMapping("/api/admin/gallery")
    public List<Response> adminList() {
        return gallery.list(true);
    }

    @PostMapping(value = {"/api/gallery/upload", "/api/admin/gallery/upload"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadResponse upload(@RequestPart("file") MultipartFile file) {
        return new UploadResponse(gallery.upload(file));
    }

    @PostMapping({"/api/gallery", "/api/admin/gallery"})
    @ResponseStatus(HttpStatus.CREATED)
    public Response create(@Valid @RequestBody Request body) {
        return gallery.create(body);
    }

    @PutMapping({"/api/gallery/{id}", "/api/admin/gallery/{id}"})
    public Response update(@PathVariable String id, @Valid @RequestBody Request body) {
        return gallery.update(id, body);
    }

    @DeleteMapping({"/api/gallery/{id}", "/api/admin/gallery/{id}"})
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        gallery.delete(id);
    }

    @PatchMapping({"/api/gallery/reorder", "/api/admin/gallery/reorder"})
    public List<Response> reorder(@Valid @RequestBody ReorderRequest body) {
        return gallery.reorder(body.ids());
    }
}
