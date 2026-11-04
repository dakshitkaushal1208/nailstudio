package com.cuteicles.backend.orders;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public final class OrderRepositories {

    private OrderRepositories() {}

    public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {

        List<CustomerOrder> findByUserIdOrderByCreatedAtDescIdDesc(Long userId);

        Optional<CustomerOrder> findByIdAndUserId(Long id, Long userId);

        Optional<CustomerOrder> findByUserIdAndIdemKey(Long userId, String idemKey);

        Optional<CustomerOrder> findByOrderNumberAndUserId(String number, Long userId);

        /** Row lock so two status changes (or a cancel racing an admin action) cannot both restore stock. */
        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("select o from CustomerOrder o where o.id = :id")
        Optional<CustomerOrder> findByIdForUpdate(@Param("id") Long id);

        @Query("""
               select o from CustomerOrder o
               where (:status is null or o.status = :status)
                 and (:payment is null or o.paymentStatus = :payment)
               order by o.createdAt desc, o.id desc
               """)
        List<CustomerOrder> search(@Param("status") OrderStatus status, @Param("payment") PaymentStatus payment);

        long countByCreatedAtAfter(Instant since);

        List<CustomerOrder> findByStatusOrderByCreatedAtDesc(OrderStatus status);
    }

    public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Long> {
        List<OrderStatusHistory> findByOrderIdInOrderByChangedAtAscIdAsc(Collection<Long> orderIds);
    }
}
