package com.cuteicles.backend.gallery;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "gallery_items")
public class GalleryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title = "";

    @Column(nullable = false, length = 1000)
    private String description = "";

    @Column(nullable = false, length = 80)
    private String category = "";

    @Column(name = "image_path", nullable = false, length = 500)
    private String imagePath;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(nullable = false)
    private boolean featured;

    @Column(nullable = false)
    private boolean published = true;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected GalleryItem() {}

    public GalleryItem(Instant now) {
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void touch(Instant now) { this.updatedAt = now; }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public String getCategory() { return category; }
    public void setCategory(String v) { this.category = v; }
    public String getImagePath() { return imagePath; }
    public void setImagePath(String v) { this.imagePath = v; }
    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int v) { this.displayOrder = v; }
    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean v) { this.featured = v; }
    public boolean isPublished() { return published; }
    public void setPublished(boolean v) { this.published = v; }
}
