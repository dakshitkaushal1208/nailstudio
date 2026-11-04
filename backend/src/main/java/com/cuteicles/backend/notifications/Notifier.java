package com.cuteicles.backend.notifications;

import com.cuteicles.backend.config.AppProperties;
import com.cuteicles.backend.settings.SettingsService;
import org.springframework.stereotype.Component;

/** Builds the wording for each kind of message. Keeps business services free of text. */
@Component
public class Notifier {

    private final NotificationService delivery;
    private final AppProperties props;
    private final SettingsService settings;

    public Notifier(NotificationService delivery, AppProperties props, SettingsService settings) {
        this.delivery = delivery;
        this.props = props;
        this.settings = settings;
    }

    public void bookingCreated(Long userId, String email, String name, String service, String when) {
        if (!settings.notifyBookingEmail()) {
            return;
        }
        delivery.send(new Notification(NotificationType.BOOKING_CREATED, userId, email, name,
                "We received your appointment request",
                "Hi " + name + ",\n\nWe received your request for " + service + " on " + when
                        + ". It is not confirmed until the studio approves it; you will see the status in My Bookings.\n",
                false));
    }

    public void bookingStatus(Long userId, String email, String name, String service, String when, String status, String adminNote) {
        if (!settings.notifyBookingEmail()) {
            return;
        }
        String note = adminNote == null || adminNote.isBlank() ? "" : "\nNote from the studio: " + adminNote + "\n";
        NotificationType type = "CANCELLED".equals(status) ? NotificationType.BOOKING_CANCELLED : NotificationType.BOOKING_STATUS;
        delivery.send(new Notification(type, userId, email, name,
                "Your appointment is now " + status.toLowerCase(),
                "Hi " + name + ",\n\nYour appointment for " + service + " on " + when + " is now " + status.toLowerCase() + ".\n" + note,
                false));
    }

    public void orderCreated(Long userId, String email, String name, String number, String total) {
        if (!settings.notifyOrderEmail()) {
            return;
        }
        delivery.send(new Notification(NotificationType.ORDER_CREATED, userId, email, name,
                "We received your order " + number,
                "Hi " + name + ",\n\nThank you for your order " + number + " (total " + total
                        + "). The studio will confirm it and contact you about payment and delivery.\n",
                false));
    }

    public void orderStatus(Long userId, String email, String name, String number, String status) {
        if (!settings.notifyOrderEmail()) {
            return;
        }
        delivery.send(new Notification(NotificationType.ORDER_STATUS, userId, email, name,
                "Order " + number + " is now " + status.toLowerCase(),
                "Hi " + name + ",\n\nYour order " + number + " is now " + status.toLowerCase() + ".\n",
                false));
    }

    /** The code appears only in the message body and is never logged. */
    public void passwordReset(Long userId, String email, String name, String code) {
        int minutes = props.security().resetTokenMinutes();
        delivery.send(new Notification(NotificationType.PASSWORD_RESET, userId, email, name,
                "Your Cute Icles verification code: " + code,
                "Hi " + name + ",\n\nYour password reset code is: " + code + "\n\nIt expires in " + minutes
                        + " minutes and can be used once. Never share it with anyone; we will never ask for it.\n"
                        + "\nIf you did not ask for this, ignore this email; your password has not changed.\n",
                true));
    }
}
