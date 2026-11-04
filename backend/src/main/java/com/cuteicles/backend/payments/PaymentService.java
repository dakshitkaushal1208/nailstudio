package com.cuteicles.backend.payments;

import com.cuteicles.backend.common.ApiException;
import com.cuteicles.backend.config.AppProperties;
import com.cuteicles.backend.orders.PaymentStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Clock;
import java.util.List;
import java.util.Locale;

@Service
public class PaymentService {

    private final List<PaymentProvider> providers;
    private final PaymentRepository payments;
    private final AppProperties props;
    private final Clock clock;

    public PaymentService(List<PaymentProvider> providers, PaymentRepository payments, AppProperties props, Clock clock) {
        this.providers = providers;
        this.payments = payments;
        this.props = props;
        this.clock = clock;
    }

    /** Resolves a requested method, defaulting to the configured one. Throws 400 for unknown or disabled methods. */
    public PaymentProvider resolve(String requested) {
        String m = requested == null || requested.isBlank() ? props.payments().defaultMethod() : requested;
        String code = m.trim().toUpperCase(Locale.ROOT);
        return providers.stream().filter(p -> p.method().equals(code) && p.enabled()).findFirst()
                .orElseThrow(() -> ApiException.badRequest("That payment method is not available."));
    }

    public PaymentStatus start(Long orderId, BigDecimal amount, PaymentProvider provider) {
        PaymentProvider.Result r = provider.initiate(orderId, amount);
        payments.save(new Payment(orderId, provider.method(), r.status(), amount, r.reference(), clock.instant()));
        return r.status();
    }

    /** Keeps the payment rows in step when the studio records money received or refunded. */
    public void record(Long orderId, PaymentStatus status) {
        for (Payment p : payments.findByOrderId(orderId)) {
            p.setStatus(status, clock.instant());
        }
    }
}
