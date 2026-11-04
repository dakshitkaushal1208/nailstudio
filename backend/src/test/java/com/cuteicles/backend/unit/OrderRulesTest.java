package com.cuteicles.backend.unit;

import com.cuteicles.backend.appointments.AppointmentStatus;
import com.cuteicles.backend.orders.OrderPricing;
import com.cuteicles.backend.orders.OrderStatus;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OrderRulesTest {

    private static BigDecimal b(String s) { return new BigDecimal(s); }

    @Test
    void deliveryIsUnknownUntilStudioSetsACharge() {
        assertNull(OrderPricing.delivery(b("500"), null, null));
    }

    @Test
    void deliveryIsFreeAtOrAboveThreshold() {
        assertEquals(0, OrderPricing.delivery(b("2000"), b("60"), b("1999")).signum());
        assertEquals(0, OrderPricing.delivery(b("1000"), b("60"), b("1999")).compareTo(b("60")));
    }

    @Test
    void totalsAreComputedOnTheServer() {
        assertEquals(0, OrderPricing.lineTotal(b("1450.50"), 3).compareTo(b("4351.50")));
        assertEquals(0, OrderPricing.total(b("1450"), b("60")).compareTo(b("1510")));
        assertEquals(0, OrderPricing.total(b("1450"), null).compareTo(b("1450")));
    }

    @Test
    void orderStatusMovesAreRestricted() {
        assertTrue(OrderStatus.PLACED.targets().contains(OrderStatus.CONFIRMED));
        assertFalse(OrderStatus.PLACED.targets().contains(OrderStatus.DELIVERED));
        assertTrue(OrderStatus.DELIVERED.targets().isEmpty());
        assertTrue(OrderStatus.CANCELLED.releasesStock() && OrderStatus.REJECTED.releasesStock());
    }

    @Test
    void appointmentStatusMovesAreRestricted() {
        assertTrue(AppointmentStatus.PENDING.adminTargets().contains(AppointmentStatus.APPROVED));
        assertTrue(AppointmentStatus.CANCELLED.adminTargets().isEmpty());
        assertFalse(AppointmentStatus.OCCUPYING.contains(AppointmentStatus.REJECTED));
    }
}
