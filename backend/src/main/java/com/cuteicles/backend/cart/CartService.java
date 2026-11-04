package com.cuteicles.backend.cart;

import com.cuteicles.backend.cart.CartDtos.CartResponse;
import com.cuteicles.backend.cart.CartDtos.Line;
import com.cuteicles.backend.cart.CartRepositories.CartItemRepository;
import com.cuteicles.backend.cart.CartRepositories.CartRepository;
import com.cuteicles.backend.common.ApiException;
import com.cuteicles.backend.common.Texts;
import com.cuteicles.backend.orders.OrderPricing;
import com.cuteicles.backend.products.Product;
import com.cuteicles.backend.products.ProductRepositories.ProductRepository;
import com.cuteicles.backend.products.ProductRepositories.ProductVariantRepository;
import com.cuteicles.backend.products.ProductVariant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Server-side cart: one per user. A cart reserves nothing; stock is only taken when an order is placed. */
@Service
public class CartService {

    private final CartRepository carts;
    private final CartItemRepository items;
    private final ProductVariantRepository variants;
    private final ProductRepository products;
    private final Clock clock;

    public CartService(CartRepository carts, CartItemRepository items, ProductVariantRepository variants,
                       ProductRepository products, Clock clock) {
        this.carts = carts;
        this.items = items;
        this.variants = variants;
        this.products = products;
        this.clock = clock;
    }

    @Transactional
    public CartResponse get(Long userId) {
        return view(cartOf(userId));
    }

    @Transactional
    public CartResponse setItem(Long userId, String variantIdStr, int quantity) {
        Cart cart = cartOf(userId);
        Long vid = Texts.parseId(variantIdStr);
        ProductVariant v = vid == null ? null : variants.findById(vid).orElse(null);
        if (quantity > 0) {
            Product p = v == null ? null : products.findById(v.getProductId()).orElse(null);
            if (v == null || !v.isActive() || p == null || !p.isActive()) {
                throw ApiException.conflict("That item is no longer available.");
            }
            if (quantity > v.getStock()) {
                throw ApiException.conflict("Only " + v.getStock() + " of \"" + p.getName() + "\" left in stock.");
            }
        }
        if (vid == null) {
            throw ApiException.badRequest("Unknown item.");
        }
        CartItem existing = items.findByCartIdAndVariantId(cart.getId(), vid).orElse(null);
        if (quantity == 0) {
            if (existing != null) {
                items.delete(existing);
            }
        } else if (existing == null) {
            items.save(new CartItem(cart.getId(), vid, quantity, clock.instant()));
        } else {
            existing.setQuantity(quantity);
        }
        cart.touch(clock.instant());
        return view(cart);
    }

    @Transactional
    public CartResponse clear(Long userId) {
        Cart cart = cartOf(userId);
        items.deleteAllForCart(cart.getId());
        return new CartResponse(List.of(), BigDecimal.ZERO.setScale(2));
    }

    /** Raw lines for checkout: variantId -> quantity. */
    @Transactional(readOnly = true)
    public Map<Long, Integer> rawLines(Long userId) {
        Map<Long, Integer> out = new LinkedHashMap<>();
        carts.findByUserId(userId).ifPresent(c ->
                items.findByCartIdOrderByIdAsc(c.getId()).forEach(i -> out.put(i.getVariantId(), i.getQuantity())));
        return out;
    }

    private Cart cartOf(Long userId) {
        return carts.findByUserId(userId).orElseGet(() -> carts.save(new Cart(userId, clock.instant())));
    }

    private CartResponse view(Cart cart) {
        List<Line> lines = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO.setScale(2);
        for (CartItem i : items.findByCartIdOrderByIdAsc(cart.getId())) {
            ProductVariant v = variants.findById(i.getVariantId()).orElse(null);
            Product p = v == null ? null : products.findById(v.getProductId()).orElse(null);
            if (v == null || p == null) {
                continue;
            }
            boolean available = v.isActive() && p.isActive() && v.getStock() >= i.getQuantity();
            lines.add(new Line(String.valueOf(p.getId()), String.valueOf(v.getId()), p.getName(),
                    p.getImages().isEmpty() ? "" : p.getImages().get(0), p.getPrice(), i.getQuantity(),
                    new LinkedHashMap<>(v.getSelections()), v.getStock(), available));
            if (available) {
                subtotal = subtotal.add(OrderPricing.lineTotal(p.getPrice(), i.getQuantity()));
            }
        }
        return new CartResponse(lines, subtotal);
    }
}
