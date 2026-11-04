package com.cuteicles.backend.payments;

import com.cuteicles.backend.orders.PaymentStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/** Cash on delivery / pay-by-arrangement: stays UNPAID until the studio records that money was received. */
@Component
public class CodPaymentProvider implements PaymentProvider {

    @Override
    public String method() {
        return "COD";
    }

    @Override
    public boolean enabled() {
        return true;
    }

    @Override
    public Result initiate(Long orderId, BigDecimal amount) {
        return new Result(PaymentStatus.UNPAID, null);
    }
}
