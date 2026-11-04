package com.cuteicles.backend.cart;

import com.cuteicles.backend.cart.CartDtos.CartResponse;
import com.cuteicles.backend.cart.CartDtos.SetItemRequest;
import com.cuteicles.backend.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** All cart routes need a session; the cart owner is always the caller. */
@RestController
public class CartController {

    private final CartService cart;

    public CartController(CartService cart) {
        this.cart = cart;
    }

    @GetMapping("/api/cart")
    public CartResponse get() {
        return cart.get(CurrentUser.require().id());
    }

    @PutMapping("/api/cart/items")
    public CartResponse setItem(@Valid @RequestBody SetItemRequest body) {
        return cart.setItem(CurrentUser.require().id(), body.variantId(), body.quantity());
    }

    @DeleteMapping("/api/cart")
    public CartResponse clear() {
        return cart.clear(CurrentUser.require().id());
    }
}
