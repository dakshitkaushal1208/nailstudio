package com.cuteicles.backend.gallery;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public final class GalleryDtos {

    private GalleryDtos() {}

    public record Request(
            @NotBlank @Size(max = 150) String title,
            @Size(max = 1000) String description,
            @Size(max = 80) String category,
            @NotBlank @Size(max = 500) String imageUrl,
            Boolean featured,
            Boolean active,
            Integer displayOrder) {}

    public record Response(String id, String title, String description, String category, String imageUrl,
                           int displayOrder, boolean featured, boolean active) {}

    public record ReorderRequest(@NotNull @Size(min = 1, max = 500) List<String> ids) {}

    public record UploadResponse(String imageUrl) {}
}
