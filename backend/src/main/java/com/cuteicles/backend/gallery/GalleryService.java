package com.cuteicles.backend.gallery;

import com.cuteicles.backend.admin.ActivityService;
import com.cuteicles.backend.common.ApiException;
import com.cuteicles.backend.common.Texts;
import com.cuteicles.backend.gallery.GalleryDtos.Request;
import com.cuteicles.backend.gallery.GalleryDtos.Response;
import com.cuteicles.backend.gallery.GalleryRepositories.GalleryCategoryRepository;
import com.cuteicles.backend.gallery.GalleryRepositories.GalleryItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Clock;
import java.util.List;

@Service
public class GalleryService {

    private final GalleryItemRepository items;
    private final GalleryCategoryRepository categories;
    private final FileStorage storage;
    private final ActivityService activity;
    private final Clock clock;

    public GalleryService(GalleryItemRepository items, GalleryCategoryRepository categories, FileStorage storage,
                          ActivityService activity, Clock clock) {
        this.items = items;
        this.categories = categories;
        this.storage = storage;
        this.activity = activity;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<Response> list(boolean includeUnpublished) {
        List<GalleryItem> rows = includeUnpublished
                ? items.findAllByOrderByDisplayOrderAscIdAsc()
                : items.findByPublishedTrueOrderByDisplayOrderAscIdAsc();
        return rows.stream().map(GalleryService::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<String> categoryNames() {
        return categories.findAllByOrderByPositionAscIdAsc().stream().map(GalleryCategory::getName).toList();
    }

    public String upload(MultipartFile file) {
        return storage.storeImage(file, "gallery");
    }

    @Transactional
    public Response create(Request in) {
        GalleryItem g = new GalleryItem(clock.instant());
        g.setDisplayOrder(in.displayOrder() == null ? (int) items.count() + 1 : in.displayOrder());
        apply(g, in);
        items.save(g);
        activity.log("gallery", "Added gallery item: " + g.getTitle());
        return toResponse(g);
    }

    @Transactional
    public Response update(String idStr, Request in) {
        GalleryItem g = find(idStr);
        if (in.displayOrder() != null) {
            g.setDisplayOrder(in.displayOrder());
        }
        apply(g, in);
        return toResponse(g);
    }

    @Transactional
    public void delete(String idStr) {
        GalleryItem g = find(idStr);
        String path = g.getImagePath();
        items.delete(g);
        items.flush();
        storage.delete(path);
        activity.log("gallery", "Removed gallery item: " + g.getTitle());
    }

    @Transactional
    public List<Response> reorder(List<String> ids) {
        int pos = 1;
        for (String idStr : ids) {
            find(idStr).setDisplayOrder(pos++);
        }
        return list(true);
    }

    private GalleryItem find(String idStr) {
        Long id = Texts.parseId(idStr);
        return (id == null ? java.util.Optional.<GalleryItem>empty() : items.findById(id))
                .orElseThrow(() -> ApiException.notFound("Gallery item not found."));
    }

    private void apply(GalleryItem g, Request in) {
        g.setTitle(Texts.trim(in.title()));
        g.setDescription(Texts.trim(in.description()));
        g.setCategory(Texts.trim(in.category()));
        g.setImagePath(com.cuteicles.backend.common.Urls.safeImage(in.imageUrl(), "imageUrl"));
        boolean visible = in.active() == null || in.active();
        g.setPublished(visible);
        g.setFeatured(in.featured() != null ? in.featured() : visible);
        g.touch(clock.instant());
    }

    static Response toResponse(GalleryItem g) {
        return new Response(String.valueOf(g.getId()), g.getTitle(), g.getDescription(), g.getCategory(),
                g.getImagePath(), g.getDisplayOrder(), g.isFeatured(), g.isPublished());
    }
}
