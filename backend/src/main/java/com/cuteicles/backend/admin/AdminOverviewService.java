package com.cuteicles.backend.admin;

import com.cuteicles.backend.appointments.AppointmentDtos;
import com.cuteicles.backend.appointments.AppointmentRepository;
import com.cuteicles.backend.appointments.AppointmentService;
import com.cuteicles.backend.appointments.AppointmentStatus;
import com.cuteicles.backend.orders.OrderRepositories.OrderRepository;
import com.cuteicles.backend.orders.OrderStatus;
import com.cuteicles.backend.products.ProductRepositories.ProductRepository;
import com.cuteicles.backend.products.ProductRepositories.ProductVariantRepository;
import com.cuteicles.backend.products.Product;
import com.cuteicles.backend.products.ProductVariant;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/** Everything on the admin dashboard is computed from live rows; nothing is hard-coded. */
@Service
public class AdminOverviewService {

    private static final int LOW_STOCK_AT = 2;

    private final AppointmentRepository appointments;
    private final OrderRepository orders;
    private final ProductVariantRepository variants;
    private final ProductRepository products;
    private final ActivityLogRepository activity;
    private final com.cuteicles.backend.orders.OrderService orderService;
    private final Clock clock;

    public AdminOverviewService(AppointmentRepository appointments, OrderRepository orders,
                                ProductVariantRepository variants, ProductRepository products,
                                ActivityLogRepository activity, com.cuteicles.backend.orders.OrderService orderService,
                                Clock clock) {
        this.appointments = appointments;
        this.orders = orders;
        this.variants = variants;
        this.products = products;
        this.activity = activity;
        this.orderService = orderService;
        this.clock = clock;
    }

    public record LowStock(String productId, String name, String variant, int stock) {}

    public record ActivityDto(String id, String type, String text, String at) {}

    public record Overview(List<AppointmentDtos.Response> pendingAppointments,
                           List<AppointmentDtos.Response> todaysAppointments,
                           long newOrders,
                           List<com.cuteicles.backend.orders.OrderDtos.Response> awaitingOrders,
                           List<LowStock> lowStock, List<ActivityDto> activity) {}

    @Transactional(readOnly = true)
    public Overview overview() {
        LocalDate today = LocalDate.now(clock);
        var pending = appointments.search(AppointmentStatus.PENDING, null).stream()
                .map(AppointmentService::toResponse).toList();
        var todays = appointments.findForDay(today, AppointmentStatus.OCCUPYING).stream()
                .map(AppointmentService::toResponse).toList();
        long newOrders = orders.countByCreatedAtAfter(Instant.now(clock).minus(Duration.ofHours(72)));
        var awaiting = orderService.search(OrderStatus.PLACED.name(), null, null);

        List<LowStock> low = new ArrayList<>();
        for (ProductVariant v : variants.findLowStock(LOW_STOCK_AT)) {
            Product p = products.findById(v.getProductId()).orElse(null);
            if (p != null && p.isActive()) {
                low.add(new LowStock(String.valueOf(p.getId()), p.getName(),
                        String.join(" / ", v.getSelections().values()), v.getStock()));
            }
        }
        var recent = activity.latest(PageRequest.of(0, 8)).stream()
                .map(a -> new ActivityDto(String.valueOf(a.getId()), a.getType(), a.getBody(), a.getCreatedAt().toString()))
                .toList();
        return new Overview(pending, todays, newOrders, awaiting, low, recent);
    }
}
