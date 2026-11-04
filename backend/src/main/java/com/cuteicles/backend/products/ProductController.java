package com.cuteicles.backend.products;

import com.cuteicles.backend.common.Paging;
import com.cuteicles.backend.products.ProductDtos.ActiveRequest;
import com.cuteicles.backend.products.ProductDtos.AdjustRequest;
import com.cuteicles.backend.products.ProductDtos.Request;
import com.cuteicles.backend.products.ProductDtos.Response;
import com.cuteicles.backend.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProductController {

    private final ProductService products;

    public ProductController(ProductService products) {
        this.products = products;
    }

    @GetMapping("/api/products")
    public Object list(@RequestParam(required = false) String search, @RequestParam(required = false) String category,
                       @RequestParam(required = false) String shape, @RequestParam(required = false) String sort,
                       @RequestParam(required = false, defaultValue = "false") boolean availableOnly,
                       @RequestParam(required = false) String ids, @RequestParam(required = false) Integer page,
                       @RequestParam(required = false) Integer size) {
        return Paging.apply(products.listPublic(search, category, shape, sort, availableOnly, ids), page, size);
    }

    @GetMapping("/api/products/{key}")
    public Response one(@PathVariable String key) {
        return products.getPublic(key);
    }

    @GetMapping("/api/admin/products")
    public Object adminList(@RequestParam(required = false) Integer page, @RequestParam(required = false) Integer size) {
        return Paging.apply(products.listAdmin(), page, size);
    }

    @GetMapping("/api/admin/products/{id}")
    public Response adminOne(@PathVariable String id) {
        return products.getAdmin(id);
    }

    @PostMapping("/api/admin/products")
    @ResponseStatus(HttpStatus.CREATED)
    public Response create(@Valid @RequestBody Request body) {
        return products.create(body, CurrentUser.require().id());
    }

    @PutMapping("/api/admin/products/{id}")
    public Response update(@PathVariable String id, @Valid @RequestBody Request body) {
        return products.update(id, body, CurrentUser.require().id());
    }

    @PatchMapping("/api/admin/products/{id}")
    public Response setActive(@PathVariable String id, @Valid @RequestBody ActiveRequest body) {
        return products.setActive(id, body.active());
    }

    @PostMapping("/api/admin/products/{id}/variants/{variantId}/adjust")
    public Response adjust(@PathVariable String id, @PathVariable String variantId,
                           @Valid @RequestBody AdjustRequest body) {
        return products.adjust(id, variantId, body, CurrentUser.require().id());
    }
}
