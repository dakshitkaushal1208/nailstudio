package com.cuteicles.backend.products;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public final class ProductRepositories {

    private ProductRepositories() {}

    public interface ProductRepository extends JpaRepository<Product, Long> {
        Optional<Product> findBySlug(String slug);

        boolean existsBySlugAndIdNot(String slug, Long id);

        boolean existsBySlug(String slug);

        List<Product> findAllByOrderByCreatedAtDescIdDesc();

        List<Product> findByActiveTrueOrderByCreatedAtDescIdDesc();

        List<Product> findByIdInAndActiveTrue(Collection<Long> ids);
    }

    public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

        /**
         * Atomic stock reservation. The WHERE clause is what prevents overselling: with two buyers
         * racing for the last item, only one UPDATE matches a row (returns 1), the other returns 0.
         */
        @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Query("update ProductVariant v set v.stock = v.stock - :qty where v.id = :id and v.active = true and v.stock >= :qty")
        int reserve(@Param("id") Long id, @Param("qty") int qty);

        @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Query("update ProductVariant v set v.stock = v.stock + :qty where v.id = :id")
        int restore(@Param("id") Long id, @Param("qty") int qty);

        @Query("select v from ProductVariant v where v.active = true and v.stock <= :max order by v.stock asc")
        List<ProductVariant> findLowStock(@Param("max") int max);
    }

    public interface InventoryAdjustmentRepository extends JpaRepository<InventoryAdjustment, Long> {}
}
