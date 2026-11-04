package com.cuteicles.backend.gallery;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public final class GalleryRepositories {

    private GalleryRepositories() {}

    public interface GalleryItemRepository extends JpaRepository<GalleryItem, Long> {
        List<GalleryItem> findByPublishedTrueOrderByDisplayOrderAscIdAsc();

        List<GalleryItem> findAllByOrderByDisplayOrderAscIdAsc();
    }

    public interface GalleryCategoryRepository extends JpaRepository<GalleryCategory, Long> {
        List<GalleryCategory> findAllByOrderByPositionAscIdAsc();
    }
}
