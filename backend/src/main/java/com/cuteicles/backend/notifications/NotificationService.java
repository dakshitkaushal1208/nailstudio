package com.cuteicles.backend.notifications;

/** Delivery abstraction. Implementations must never throw into business flows. */
public interface NotificationService {

    void send(Notification notification);
}
