package com.cuteicles.backend.orders;

import com.cuteicles.backend.orders.OrderDtos.CancelRequest;
import com.cuteicles.backend.orders.OrderDtos.PlaceRequest;
import com.cuteicles.backend.orders.OrderDtos.Response;
import com.cuteicles.backend.orders.OrderDtos.UpdateRequest;
import com.cuteicles.backend.security.AuthUser;
import com.cuteicles.backend.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class OrderController {

    private final OrderService orders;

    public OrderController(OrderService orders) {
        this.orders = orders;
    }

    @PostMapping("/api/orders")
    @ResponseStatus(HttpStatus.CREATED)
    public Response place(@Valid @RequestBody PlaceRequest body,
                          @RequestHeader(value = "Idempotency-Key", required = false) String idemKey) {
        AuthUser caller = CurrentUser.require();
        try {
            return orders.place(caller, body, idemKey);
        } catch (DataIntegrityViolationException e) {
            // Two identical requests raced; the unique (user, key) constraint let one through. Return that order.
            return orders.findByIdemKey(caller.id(), idemKey).orElseThrow(() -> e);
        }
    }

    @GetMapping("/api/orders/my")
    public List<Response> mine() {
        return orders.listMine(CurrentUser.require());
    }

    @GetMapping("/api/orders/{id}")
    public Response one(@PathVariable String id) {
        return orders.getMine(CurrentUser.require(), id);
    }

    @PostMapping("/api/orders/{id}/cancel")
    public Response cancel(@PathVariable String id, @Valid @RequestBody(required = false) CancelRequest body) {
        return orders.cancelMine(CurrentUser.require(), id, body == null ? null : body.reason());
    }

    @GetMapping("/api/admin/orders")
    public List<Response> adminList(@RequestParam(required = false) String status,
                                    @RequestParam(required = false) String paymentStatus,
                                    @RequestParam(required = false) String search) {
        return orders.search(status, paymentStatus, search);
    }

    @GetMapping("/api/admin/orders/{id}")
    public Response adminOne(@PathVariable String id) {
        return orders.getAdmin(id);
    }

    @PatchMapping("/api/admin/orders/{id}")
    public Response adminUpdate(@PathVariable String id, @Valid @RequestBody UpdateRequest body) {
        return orders.update(CurrentUser.require(), id, body);
    }
}
