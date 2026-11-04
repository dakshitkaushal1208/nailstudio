package com.cuteicles.backend.products;

import com.cuteicles.backend.admin.ActivityService;
import com.cuteicles.backend.common.ApiException;
import com.cuteicles.backend.common.Texts;
import com.cuteicles.backend.common.Urls;
import com.cuteicles.backend.products.ProductDtos.AdjustRequest;
import com.cuteicles.backend.products.ProductDtos.OptionDto;
import com.cuteicles.backend.products.ProductDtos.Request;
import com.cuteicles.backend.products.ProductDtos.Response;
import com.cuteicles.backend.products.ProductDtos.VariantDto;
import com.cuteicles.backend.products.ProductDtos.VariantResponse;
import com.cuteicles.backend.products.ProductRepositories.InventoryAdjustmentRepository;
import com.cuteicles.backend.products.ProductRepositories.ProductRepository;
import com.cuteicles.backend.products.ProductRepositories.ProductVariantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class ProductService {

    private final ProductRepository products;
    private final ProductVariantRepository variants;
    private final InventoryAdjustmentRepository adjustments;
    private final ActivityService activity;
    private final Clock clock;

    public ProductService(ProductRepository products, ProductVariantRepository variants,
                          InventoryAdjustmentRepository adjustments, ActivityService activity, Clock clock) {
        this.products = products;
        this.variants = variants;
        this.adjustments = adjustments;
        this.activity = activity;
        this.clock = clock;
    }

    // ---------- public ----------

    @Transactional(readOnly = true)
    public List<Response> listPublic(String search, String category, String shape, String sort,
                                     boolean availableOnly, String ids) {
        List<Product> rows;
        if (ids != null && !ids.isBlank()) {
            Set<Long> wanted = new HashSet<>();
            for (String part : ids.split(",")) {
                Long id = Texts.parseId(part.trim());
                if (id != null) {
                    wanted.add(id);
                }
            }
            rows = wanted.isEmpty() ? List.of() : products.findByIdInAndActiveTrue(wanted);
        } else {
            rows = products.findByActiveTrueOrderByCreatedAtDescIdDesc();
        }
        String q = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        List<Product> out = new ArrayList<>();
        for (Product p : rows) {
            if (!q.isEmpty() && !(p.getName() + " " + p.getCategory() + " " + p.getDescription())
                    .toLowerCase(Locale.ROOT).contains(q)) {
                continue;
            }
            if (category != null && !category.isBlank() && !category.equals(p.getCategory())) {
                continue;
            }
            if (shape != null && !shape.isBlank() && p.getOptions().stream()
                    .noneMatch(o -> o.getName().equals("Shape") && o.getValues().contains(shape))) {
                continue;
            }
            if (availableOnly && totalStock(p) <= 0) {
                continue;
            }
            out.add(p);
        }
        Comparator<Product> byNewest = Comparator.comparing(Product::getCreatedAt).reversed();
        if ("price-asc".equals(sort)) {
            out.sort(Comparator.comparing(Product::getPrice));
        } else if ("price-desc".equals(sort)) {
            out.sort(Comparator.comparing(Product::getPrice).reversed());
        } else {
            out.sort(byNewest);
        }
        return out.stream().map(ProductService::toResponse).toList();
    }

    /** key = numeric id or slug. Inactive products are 404 to the public. */
    @Transactional(readOnly = true)
    public Response getPublic(String key) {
        Product p = findByKey(key);
        if (!p.isActive()) {
            throw ApiException.notFound("We could not find that product.");
        }
        return toResponse(p);
    }

    private static int totalStock(Product p) {
        return p.getVariants().stream().filter(ProductVariant::isActive).mapToInt(ProductVariant::getStock).sum();
    }

    // ---------- admin ----------

    @Transactional(readOnly = true)
    public List<Response> listAdmin() {
        return products.findAllByOrderByCreatedAtDescIdDesc().stream().map(ProductService::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Response getAdmin(String key) {
        return toResponse(findByKey(key));
    }

    @Transactional
    public Response create(Request in, Long adminId) {
        Product p = new Product(clock.instant());
        apply(p, in, adminId);
        products.save(p);
        activity.log("product", "Added product: " + p.getName());
        return toResponse(p);
    }

    @Transactional
    public Response update(String idStr, Request in, Long adminId) {
        Product p = findByKey(idStr);
        apply(p, in, adminId);
        p.touch(clock.instant());
        return toResponse(p);
    }

    @Transactional
    public Response setActive(String idStr, boolean active) {
        Product p = findByKey(idStr);
        p.setActive(active);
        p.touch(clock.instant());
        activity.log("product", p.getName() + (active ? " is now visible" : " is now hidden"));
        return toResponse(p);
    }

    /** Atomic stock change with an audit row. Refuses to take stock below zero. */
    @Transactional
    public Response adjust(String productKey, String variantIdStr, AdjustRequest in, Long adminId) {
        Product p = findByKey(productKey);
        Long vid = Texts.parseId(variantIdStr);
        ProductVariant v = p.getVariants().stream().filter(x -> x.getId().equals(vid)).findFirst()
                .orElseThrow(() -> ApiException.notFound("Variant not found."));
        int delta = in.delta();
        if (delta == 0) {
            throw ApiException.badRequest("Enter a change other than zero.");
        }
        int changed = delta > 0 ? variants.restore(v.getId(), delta) : variants.reserve(v.getId(), -delta);
        if (changed == 0) {
            throw ApiException.conflict("Stock cannot go below zero (or the variant is inactive).");
        }
        adjustments.save(new InventoryAdjustment(v.getId(), delta, Texts.trim(in.reason()), adminId, clock.instant()));
        activity.log("inventory", p.getName() + " stock adjusted by " + delta);
        return toResponse(products.findById(p.getId()).orElseThrow());
    }

    private Product findByKey(String key) {
        Long id = Texts.parseId(key);
        java.util.Optional<Product> found = id != null ? products.findById(id) : products.findBySlug(Texts.trim(key));
        return found.orElseThrow(() -> ApiException.notFound("We could not find that product."));
    }

    private void apply(Product p, Request in, Long adminId) {
        Map<String, String> errors = new LinkedHashMap<>();

        if (in.price() == null || in.price().signum() <= 0) {
            errors.put("price", "Enter a price above zero.");
        }
        if (in.compareAtPrice() != null && in.price() != null && in.compareAtPrice().compareTo(in.price()) < 0) {
            errors.put("compareAtPrice", "The original price must not be lower than the price.");
        }
        String slug = Texts.slugify(Texts.trim(in.slug()).isEmpty() ? in.name() : in.slug());
        if (slug.isEmpty()) {
            errors.put("slug", "A web address is required.");
        } else if (p.getId() == null ? products.existsBySlug(slug) : products.existsBySlugAndIdNot(slug, p.getId())) {
            errors.put("slug", "Another product already uses this web address.");
        }

        List<String> images = new ArrayList<>();
        for (String u : in.images() == null ? List.<String>of() : in.images()) {
            if (!Texts.trim(u).isEmpty()) {
                try {
                    images.add(Urls.safeImage(u, "images"));
                } catch (ApiException e) {
                    errors.put("images", "Use uploaded images or https:// addresses.");
                }
            }
        }
        if (images.isEmpty()) {
            errors.put("images", "Add at least one image.");
        }

        // options: names must be unique, each with at least one value
        List<OptionDto> options = in.options() == null ? List.of() : in.options();
        Map<String, List<String>> optionValues = new LinkedHashMap<>();
        for (OptionDto o : options) {
            String name = Texts.trim(o.name());
            List<String> vals = o.values().stream().map(Texts::trim).filter(s -> !s.isEmpty()).distinct().toList();
            if (name.isEmpty() || vals.isEmpty() || optionValues.putIfAbsent(name, vals) != null) {
                errors.put("options", "Each option needs a unique name and at least one value.");
            }
        }

        List<VariantDto> variantDtos = in.variants() == null ? List.of() : in.variants();
        if (variantDtos.isEmpty()) {
            errors.put("variants", "Add at least one variant.");
        }
        Set<Map<String, String>> seen = new HashSet<>();
        for (VariantDto v : variantDtos) {
            Map<String, String> sel = v.options() == null ? Map.of() : v.options();
            boolean ok = sel.keySet().equals(optionValues.keySet());
            if (ok) {
                for (Map.Entry<String, String> e : sel.entrySet()) {
                    ok &= optionValues.get(e.getKey()).contains(e.getValue());
                }
            }
            if (!ok || !seen.add(new HashMap<>(sel))) {
                errors.put("variants", "Each variant must pick one valid value per option, and no two may match.");
            }
            if (v.stock() != null && v.stock() < 0) {
                errors.put("variants", "Stock cannot be negative.");
            }
        }
        if (!errors.isEmpty()) {
            throw ApiException.invalid("Please fix the highlighted fields.", errors);
        }

        p.setName(Texts.trim(in.name()));
        p.setSlug(slug);
        p.setDescription(Texts.trim(in.description()));
        p.setCategory(Texts.trim(in.category()));
        p.setPrice(in.price().setScale(2, java.math.RoundingMode.HALF_UP));
        p.setCompareAtPrice(in.compareAtPrice() == null ? null : in.compareAtPrice().setScale(2, java.math.RoundingMode.HALF_UP));
        p.setSku(Texts.trim(in.sku()));
        p.setFeatured(Boolean.TRUE.equals(in.featured()));
        p.setActive(in.active() == null || in.active());
        p.getImages().clear();
        p.getImages().addAll(images);
        p.getDetails().clear();
        for (String d : in.details() == null ? List.<String>of() : in.details()) {
            if (!Texts.trim(d).isEmpty()) {
                p.getDetails().add(Texts.trim(d));
            }
        }
        p.getOptions().clear();
        int pos = 0;
        for (Map.Entry<String, List<String>> e : optionValues.entrySet()) {
            p.getOptions().add(new ProductOption(e.getKey(), pos++, e.getValue()));
        }

        // Variants are matched by id; they are never deleted (orders may reference them), only deactivated.
        Map<Long, ProductVariant> existing = new HashMap<>();
        p.getVariants().forEach(v -> existing.put(v.getId(), v));
        Set<Long> kept = new HashSet<>();
        for (VariantDto dto : variantDtos) {
            Long vid = Texts.parseId(dto.id());
            ProductVariant v = vid == null ? null : existing.get(vid);
            int stock = dto.stock() == null ? 0 : dto.stock();
            boolean active = dto.active() == null || dto.active();
            if (v == null) {
                v = new ProductVariant(Texts.trim(dto.sku()), stock, active, dto.options(), clock.instant());
                p.getVariants().add(v);
            } else {
                kept.add(v.getId());
                if (v.getStock() != stock) {
                    adjustments.save(new InventoryAdjustment(v.getId(), stock - v.getStock(), "Edited in product form",
                            adminId, clock.instant()));
                    v.setStock(stock);
                }
                v.setSku(Texts.trim(dto.sku()));
                v.setActive(active);
                v.setSelections(dto.options());
            }
        }
        existing.values().stream().filter(v -> !kept.contains(v.getId())).forEach(v -> v.setActive(false));
    }

    public static Response toResponse(Product p) {
        List<OptionDto> options = p.getOptions().stream().map(o -> new OptionDto(o.getName(), List.copyOf(o.getValues()))).toList();
        List<VariantResponse> vs = p.getVariants().stream()
                .map(v -> new VariantResponse(String.valueOf(v.getId()), new LinkedHashMap<>(v.getSelections()),
                        v.getStock(), v.getSku(), v.isActive())).toList();
        return new Response(String.valueOf(p.getId()), p.getSlug(), p.getName(), p.getCategory(), p.getPrice(),
                p.getCompareAtPrice(), p.getDescription(), List.copyOf(p.getDetails()), List.copyOf(p.getImages()),
                options, vs, p.isActive(), p.isFeatured(), p.getCreatedAt().toString());
    }
}
