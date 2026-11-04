package com.cuteicles.backend.gallery;

import org.springframework.web.multipart.MultipartFile;

/** Storage abstraction: local disk today, object storage later without touching callers. */
public interface FileStorage {

    /** Validates and stores an image; returns its public path such as /uploads/gallery/uuid.jpg. */
    String storeImage(MultipartFile file, String folder);

    /** Removes a previously stored file. Silently ignores paths this storage does not own. */
    void delete(String publicPath);
}
