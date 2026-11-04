package com.cuteicles.backend.payments;

import com.cuteicles.backend.config.AppProperties;
import com.cuteicles.backend.orders.PaymentStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/** Development-only. Moves no money; the reference is prefixed TEST- so it can never be mistaken for a real payment. */
@Component
public class TestPaymentProvider implements PaymentProvider {

    private final boolean enabled;

    public TestPaymentProvider(AppProperties props) {
        this.enabled = props.payments().testModeEnabled();
    }

    @Override
    public String method() {
        return "TEST";
    }

    @Override
    public boolean enabled() {
        return enabled;
    }

    @Override
    public Result initiate(Long orderId, BigDecimal amount) {
        return new Result(PaymentStatus.PAID, "TEST-" + UUID.randomUUID());
    }
}
