package com.cuteicles.backend.cart;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public final class CartRepositories {

    private CartRepositories() {}

    public interface CartRepository extends JpaRepository<Cart, Long> {
        Optional<Cart> findByUserId(Long userId);
    }

    public interface CartItemRepository extends JpaRepository<CartItem, Long> {
        List<CartItem> findByCartIdOrderByIdAsc(Long cartId);

        Optional<CartItem> findByCartIdAndVariantId(Long cartId, Long variantId);

        @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Query("delete from CartItem i where i.cartId = :cartId")
        int deleteAllForCart(@Param("cartId") Long cartId);
    }
}
