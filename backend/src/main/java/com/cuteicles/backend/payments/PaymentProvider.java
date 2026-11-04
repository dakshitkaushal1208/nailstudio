package com.cuteicles.backend.payments;

import com.cuteicles.backend.orders.PaymentStatus;

import java.math.BigDecimal;

/**
 * One implementation per payment method. A real online gateway would be another implementation
 * that confirms payment from the provider's signed webhook, never from the browser.
 */
public interface PaymentProvider {

    /** Method code stored on the order, e.g. COD or TEST. */
    String method();

    /** False when this method is switched off by configuration. */
    boolean enabled();

    Result initiate(Long orderId, BigDecimal amount);

    record Result(PaymentStatus status, String reference) {}
}
