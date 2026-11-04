package com.cuteicles.backend.integration;

import com.cuteicles.backend.admin.AdminController;
import com.cuteicles.backend.availability.AvailabilityRepositories.WorkingHoursRepository;
import com.cuteicles.backend.cart.CartRepositories.CartRepository;
import com.cuteicles.backend.gallery.GalleryRepositories.GalleryItemRepository;
import com.cuteicles.backend.orders.OrderRepositories.OrderRepository;
import com.cuteicles.backend.orders.OrderRepositories.OrderStatusHistoryRepository;
import com.cuteicles.backend.products.ProductRepositories.ProductRepository;
import com.cuteicles.backend.products.ProductRepositories.ProductVariantRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertNotNull;

/** The application context must start with every repository and the admin controller wired. */
@SpringBootTest
@ActiveProfiles("test")
class RepositoryWiringIT {

    @Autowired ApplicationContext ctx;

    @Test
    void contextStartsAndNestedRepositoriesAreBeans() {
        for (Class<?> type : new Class<?>[] {OrderRepository.class, OrderStatusHistoryRepository.class,
                ProductRepository.class, ProductVariantRepository.class, CartRepository.class,
                GalleryItemRepository.class, WorkingHoursRepository.class, AdminController.class}) {
            assertNotNull(ctx.getBean(type), type.getSimpleName());
        }
    }
}
