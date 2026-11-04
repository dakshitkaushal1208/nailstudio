package com.cuteicles.backend.orders;

import com.cuteicles.backend.admin.ActivityService;
import com.cuteicles.backend.cart.CartService;
import com.cuteicles.backend.common.ApiException;
import com.cuteicles.backend.common.Texts;
import com.cuteicles.backend.notifications.Notifier;
import com.cuteicles.backend.orders.OrderDtos.CustomerDto;
import com.cuteicles.backend.orders.OrderDtos.HistoryDto;
import com.cuteicles.backend.orders.OrderDtos.ItemRequest;
import com.cuteicles.backend.orders.OrderDtos.LineDto;
import com.cuteicles.backend.orders.OrderDtos.PlaceRequest;
import com.cuteicles.backend.orders.OrderDtos.Response;
import com.cuteicles.backend.orders.OrderDtos.ShippingInput;
import com.cuteicles.backend.orders.OrderDtos.TrackingDto;
import com.cuteicles.backend.orders.OrderDtos.UpdateRequest;
import com.cuteicles.backend.orders.OrderRepositories.OrderRepository;
import com.cuteicles.backend.orders.OrderRepositories.OrderStatusHistoryRepository;
import com.cuteicles.backend.payments.PaymentProvider;
import com.cuteicles.backend.payments.PaymentService;
import com.cuteicles.backend.products.Product;
import com.cuteicles.backend.products.ProductRepositories.ProductRepository;
import com.cuteicles.backend.products.ProductRepositories.ProductVariantRepository;
import com.cuteicles.backend.products.ProductVariant;
import com.cuteicles.backend.security.AuthUser;
import com.cuteicles.backend.settings.SettingsService;
import com.cuteicles.backend.users.User;
import com.cuteicles.backend.users.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

@Service
public class OrderService {

    private static final int MAX_QTY_PER_LINE = 20;

    private final OrderRepository orders;
    private final OrderStatusHistoryRepository history;
    private final ProductRepository products;
    private final ProductVariantRepository variants;
    private final UserRepository users;
    private final CartService cart;
    private final SettingsService settings;
    private final PaymentService payments;
    private final Notifier notifier;
    private final ActivityService activity;
    private final Clock clock;

    public OrderService(OrderRepository orders, OrderStatusHistoryRepository history, ProductRepository products,
                        ProductVariantRepository variants, UserRepository users, CartService cart,
                        SettingsService settings, PaymentService payments, Notifier notifier,
                        ActivityService activity, Clock clock) {
        this.orders = orders;
        this.history = history;
        this.products = products;
        this.variants = variants;
        this.users = users;
        this.cart = cart;
        this.settings = settings;
        this.payments = payments;
        this.notifier = notifier;
        this.activity = activity;
        this.clock = clock;
    }

    // ---------- customer ----------

    /**
     * Places an order. Prices come from the catalogue, stock is taken with an atomic conditional UPDATE
     * per variant (so the last unit can only be sold once), and everything rolls back if any line fails.
     * A repeated Idempotency-Key returns the original order instead of creating a second one.
     */
    @Transactional
    public Response place(AuthUser caller, PlaceRequest req, String idemKey) {
        String key = idemKey == null || idemKey.isBlank() ? null : Texts.trim(idemKey);
        if (key != null && key.length() > 80) {
            throw ApiException.badRequest("Idempotency-Key is too long.");
        }
        if (key != null) {
            Optional<CustomerOrder> prior = orders.findByUserIdAndIdemKey(caller.id(), key);
            if (prior.isPresent()) {
                return toResponse(prior.get(), historyFor(List.of(prior.get())));
            }
        }

        // 1. Work out the lines (body, or the server cart), merged per variant.
        boolean fromCart = req.items() == null || req.items().isEmpty();
        Map<Long, Integer> wanted = new TreeMap<>(); // sorted ids: consistent lock order, no deadlocks
        if (fromCart) {
            cart.rawLines(caller.id()).forEach((v, q) -> wanted.merge(v, q, Integer::sum));
        } else {
            for (ItemRequest it : req.items()) {
                Long vid = Texts.parseId(it.variantId());
                if (vid == null) {
                    throw ApiException.conflict("One of the items is no longer available.");
                }
                wanted.merge(vid, it.qty(), Integer::sum);
            }
        }
        if (wanted.isEmpty()) {
            throw ApiException.badRequest("Your order has no items.");
        }

        // 2. Validate against the catalogue and price it. Nothing is written yet.
        List<OrderItem> lines = new ArrayList<>();
        Map<Long, Integer> toReserve = new LinkedHashMap<>();
        Map<Long, String> names = new HashMap<>();
        BigDecimal subtotal = BigDecimal.ZERO.setScale(2);
        for (Map.Entry<Long, Integer> e : wanted.entrySet()) {
            int qty = e.getValue();
            ProductVariant v = variants.findById(e.getKey()).orElse(null);
            Product p = v == null ? null : products.findById(v.getProductId()).orElse(null);
            if (v == null || p == null || !v.isActive() || !p.isActive()) {
                throw ApiException.conflict("One of the items is no longer available.");
            }
            if (qty > MAX_QTY_PER_LINE) {
                throw ApiException.badRequest("You can order at most " + MAX_QTY_PER_LINE + " of one item.");
            }
            if (qty > v.getStock()) {
                throw ApiException.conflict(stockMessage(p.getName(), v));
            }
            lines.add(new OrderItem(p.getId(), v.getId(), p.getName(), p.getImages().isEmpty() ? "" : p.getImages().get(0),
                    v.getSku(), p.getPrice(), qty, v.getSelections()));
            toReserve.put(v.getId(), qty);
            names.put(v.getId(), stockMessage(p.getName(), v));
            subtotal = subtotal.add(OrderPricing.lineTotal(p.getPrice(), qty));
        }
        SettingsService.Rules rules = settings.rules();
        if (rules.minOrderValue() != null && subtotal.compareTo(rules.minOrderValue()) < 0) {
            throw ApiException.badRequest("The minimum order is ₹" + rules.minOrderValue().stripTrailingZeros().toPlainString() + ".");
        }
        BigDecimal delivery = OrderPricing.delivery(subtotal, rules.deliveryCharge(), rules.freeAbove());
        BigDecimal total = OrderPricing.total(subtotal, delivery);
        PaymentProvider provider = payments.resolve(req.paymentMethod());

        User user = users.findById(caller.id()).orElseThrow(() -> ApiException.unauthorized("Please sign in again."));
        ShippingInput s = req.shipping();
        String phone = Texts.compactPhone(req.customer() != null && req.customer().phone() != null
                && !req.customer().phone().isBlank() ? req.customer().phone() : s.phone());

        // 3. Take the stock. Each UPDATE only succeeds if enough is left; a miss aborts and rolls back all of it.
        for (Map.Entry<Long, Integer> e : toReserve.entrySet()) {
            if (variants.reserve(e.getKey(), e.getValue()) != 1) {
                throw ApiException.conflict(names.get(e.getKey()));
            }
        }

        // 4. Write the order.
        Instant now = clock.instant();
        CustomerOrder o = new CustomerOrder(user.getId(), now);
        o.setCustomer(user.getName(), user.getEmail(), phone);
        o.setShipping(Texts.trim(s.name()), Texts.compactPhone(s.phone()), Texts.trim(s.street()),
                Texts.trim(s.locality()), Texts.trim(s.city()), Texts.trim(s.state()), Texts.trim(s.pin()));
        o.setAmounts(subtotal, delivery, total);
        o.setPaymentMethod(provider.method());
        o.setIdemKey(key);
        o.getItems().addAll(lines);
        orders.save(o);
        o.setOrderNumber("NS-" + (1000 + o.getId()));
        o.setPaymentStatus(payments.start(o.getId(), total, provider));
        history.save(new OrderStatusHistory(o.getId(), OrderStatus.PLACED, user.getId(), now));
        if (fromCart) {
            cart.clear(user.getId());
        }
        activity.log("order", "New order " + o.getOrderNumber() + " placed");
        notifier.orderCreated(user.getId(), user.getEmail(), user.getName(), o.getOrderNumber(), "₹" + total.toPlainString());
        return toResponse(o, historyFor(List.of(o)));
    }

    /** Used by the controller after a unique-key race: the other request won, return its order. */
    @Transactional(readOnly = true)
    public Optional<Response> findByIdemKey(Long userId, String key) {
        if (key == null || key.isBlank()) {
            return Optional.empty();
        }
        return orders.findByUserIdAndIdemKey(userId, Texts.trim(key)).map(o -> toResponse(o, historyFor(List.of(o))));
    }

    @Transactional(readOnly = true)
    public List<Response> listMine(AuthUser caller) {
        List<CustomerOrder> rows = orders.findByUserIdOrderByCreatedAtDescIdDesc(caller.id());
        Map<Long, List<HistoryDto>> h = historyFor(rows);
        return rows.stream().map(o -> toResponse(o, h)).toList();
    }

    /** Accepts the numeric id or the NS-#### number. Another user's order is a 404. */
    @Transactional(readOnly = true)
    public Response getMine(AuthUser caller, String key) {
        CustomerOrder o = ownedOrder(caller, key);
        return toResponse(o, historyFor(List.of(o)));
    }

    @Transactional
    public Response cancelMine(AuthUser caller, String key, String reason) {
        CustomerOrder found = ownedOrder(caller, key);
        CustomerOrder o = orders.findByIdForUpdate(found.getId()).orElseThrow();
        if (o.getStatus() != OrderStatus.PLACED) {
            throw ApiException.conflict("This order has already been confirmed. Please contact the studio to cancel it.");
        }
        changeStatus(o, OrderStatus.CANCELLED, caller.id());
        activity.log("order", "Order " + o.getOrderNumber() + " cancelled by customer");
        notifier.orderStatus(o.getUserId(), o.getCustomerEmail(), o.getCustomerName(), o.getOrderNumber(), "CANCELLED");
        return toResponse(o, historyFor(List.of(o)));
    }

    // ---------- admin ----------

    @Transactional(readOnly = true)
    public List<Response> search(String status, String paymentStatus, String search) {
        OrderStatus st = status == null || status.isBlank() ? null : parseStatus(status);
        PaymentStatus ps = paymentStatus == null || paymentStatus.isBlank() ? null : parsePayment(paymentStatus);
        String q = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        List<CustomerOrder> rows = orders.search(st, ps).stream()
                .filter(o -> q.isEmpty() || (o.getOrderNumber() + " " + o.getCustomerName() + " " + o.getCustomerEmail())
                        .toLowerCase(Locale.ROOT).contains(q))
                .toList();
        Map<Long, List<HistoryDto>> h = historyFor(rows);
        return rows.stream().map(o -> toResponse(o, h)).toList();
    }

    @Transactional(readOnly = true)
    public Response getAdmin(String key) {
        CustomerOrder o = anyOrder(key);
        return toResponse(o, historyFor(List.of(o)));
    }

    @Transactional
    public Response update(AuthUser admin, String key, UpdateRequest in) {
        CustomerOrder o = orders.findByIdForUpdate(anyOrder(key).getId()).orElseThrow();
        boolean statusChanged = false;
        if (in.status() != null && !in.status().isBlank()) {
            OrderStatus to = parseStatus(in.status());
            if (to != o.getStatus()) {
                if (!o.getStatus().targets().contains(to)) {
                    throw ApiException.conflict("That status change is not allowed for this order.");
                }
                changeStatus(o, to, admin.id());
                statusChanged = true;
            }
        }
        if (in.paymentStatus() != null && !in.paymentStatus().isBlank()) {
            PaymentStatus to = parsePayment(in.paymentStatus());
            if (to != o.getPaymentStatus()) {
                boolean ok = (o.getPaymentStatus() == PaymentStatus.UNPAID && to == PaymentStatus.PAID)
                        || (o.getPaymentStatus() == PaymentStatus.PAID && to == PaymentStatus.REFUNDED);
                if (!ok) {
                    throw ApiException.conflict("That payment change is not allowed.");
                }
                o.setPaymentStatus(to);
                payments.record(o.getId(), to);
            }
        }
        TrackingDto t = in.tracking();
        if (t != null) {
            o.setTracking(Texts.trim(t.carrier()), Texts.trim(t.number()));
        }
        if (in.adminNote() != null) {
            o.setAdminNote(in.adminNote());
        }
        o.touch(clock.instant());
        activity.log("order", "Order " + o.getOrderNumber() + " updated");
        if (statusChanged) {
            notifier.orderStatus(o.getUserId(), o.getCustomerEmail(), o.getCustomerName(), o.getOrderNumber(), o.getStatus().name());
        }
        return toResponse(o, historyFor(List.of(o)));
    }

    // ---------- helpers ----------

    private void changeStatus(CustomerOrder o, OrderStatus to, Long by) {
        if (to.releasesStock() && !o.getStatus().releasesStock()) {
            for (OrderItem it : o.getItems()) {
                variants.restore(it.getVariantId(), it.getQuantity());
            }
            if (o.getPaymentStatus() == PaymentStatus.PAID && "TEST".equals(o.getPaymentMethod())) {
                o.setPaymentStatus(PaymentStatus.REFUNDED);
                payments.record(o.getId(), PaymentStatus.REFUNDED);
            }
        }
        o.setStatus(to);
        history.save(new OrderStatusHistory(o.getId(), to, by, clock.instant()));
    }

    private CustomerOrder ownedOrder(AuthUser caller, String key) {
        Long id = Texts.parseId(key);
        Optional<CustomerOrder> found = id != null ? orders.findByIdAndUserId(id, caller.id())
                : orders.findByOrderNumberAndUserId(Texts.trim(key), caller.id());
        return found.orElseThrow(() -> ApiException.notFound("We could not find that order."));
    }

    private CustomerOrder anyOrder(String key) {
        Long id = Texts.parseId(key);
        return (id == null ? Optional.<CustomerOrder>empty() : orders.findById(id))
                .orElseThrow(() -> ApiException.notFound("Order not found."));
    }

    private static String stockMessage(String name, ProductVariant v) {
        String opts = String.join(", ", v.getSelections().values());
        return "Only " + v.getStock() + " of \"" + name + "\"" + (opts.isEmpty() ? "" : " (" + opts + ")") + " left in stock.";
    }

    private Map<Long, List<HistoryDto>> historyFor(List<CustomerOrder> rows) {
        Map<Long, List<HistoryDto>> out = new HashMap<>();
        if (rows.isEmpty()) {
            return out;
        }
        history.findByOrderIdInOrderByChangedAtAscIdAsc(rows.stream().map(CustomerOrder::getId).toList())
                .forEach(h -> out.computeIfAbsent(h.getOrderId(), k -> new ArrayList<>())
                        .add(new HistoryDto(h.getStatus().name(), h.getChangedAt().toString())));
        return out;
    }

    private static OrderStatus parseStatus(String s) {
        try {
            return OrderStatus.valueOf(s.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Unknown order status.");
        }
    }

    private static PaymentStatus parsePayment(String s) {
        try {
            return PaymentStatus.valueOf(s.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Unknown payment status.");
        }
    }

    static Response toResponse(CustomerOrder o, Map<Long, List<HistoryDto>> history) {
        List<LineDto> items = o.getItems().stream()
                .map(i -> new LineDto(String.valueOf(i.getProductId()), String.valueOf(i.getVariantId()), i.getProductName(),
                        i.getImageUrl(), i.getUnitPrice(), i.getQuantity(), new LinkedHashMap<>(i.getOptions())))
                .toList();
        ShippingInput ship = new ShippingInput(o.getShipName(), o.getShipPhone(), o.getShipStreet(), o.getShipLocality(),
                o.getShipCity(), o.getShipState(), o.getShipPin());
        return new Response(String.valueOf(o.getId()), o.getOrderNumber(), String.valueOf(o.getUserId()),
                new CustomerDto(o.getCustomerName(), o.getCustomerEmail(), o.getCustomerPhone()), items, ship,
                o.getSubtotal(), o.getDeliveryFee(), o.getTotal(), o.getStatus().name(), o.getPaymentStatus().name(),
                o.getPaymentMethod(), new TrackingDto(o.getTrackingCarrier(), o.getTrackingNumber()), o.getAdminNote(),
                o.getCreatedAt().toString(), history.getOrDefault(o.getId(), List.of()));
    }
}
