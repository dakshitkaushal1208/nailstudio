package com.cuteicles.backend.settings;

import com.cuteicles.backend.common.ApiException;
import com.cuteicles.backend.common.Texts;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SettingsService {

    private final StudioSettingsRepository repo;
    private final AboutParagraphRepository paragraphs;

    public SettingsService(StudioSettingsRepository repo, AboutParagraphRepository paragraphs) {
        this.repo = repo;
        this.paragraphs = paragraphs;
    }

    /** The business rules the booking and ordering code needs. */
    public record Rules(int slotIntervalMin, int bufferMin, int cancelHoursBefore, int minNoticeHours,
                        int maxDaysAhead, int chairs, BigDecimal deliveryCharge, BigDecimal freeAbove,
                        BigDecimal minOrderValue) {}

    @Transactional(readOnly = true)
    public StudioSettings entity() {
        return repo.findById(StudioSettings.SINGLETON_ID)
                .orElseThrow(() -> new IllegalStateException("Studio settings row is missing (migration V2 not applied?)"));
    }

    @Transactional(readOnly = true)
    public Rules rules() {
        StudioSettings s = entity();
        return new Rules(s.getSlotIntervalMin(), s.getBufferMin(), s.getCancelHoursBefore(), s.getMinNoticeHours(),
                s.getMaxDaysAhead(), s.getChairs(), s.getDeliveryCharge(), s.getFreeAbove(), s.getMinOrderValue());
    }

    @Transactional(readOnly = true)
    public boolean notifyBookingEmail() {
        return entity().isNotifyBookingEmail();
    }

    @Transactional(readOnly = true)
    public boolean notifyOrderEmail() {
        return entity().isNotifyOrderEmail();
    }

    @Transactional(readOnly = true)
    public SettingsDto get() {
        StudioSettings s = entity();
        List<String> about = paragraphs.findAllByOrderByPositionAsc().stream().map(AboutParagraph::getBody).toList();
        return new SettingsDto(
                s.getStudioName(), s.getTagline(),
                new SettingsDto.Contact(s.getPhone(), s.getEmail(), s.getAddress(), s.getMapUrl()),
                new SettingsDto.Social(s.getInstagram(), s.getFacebook(), s.getWhatsapp()),
                s.getHoursNote(), s.getServiceArea(), s.getCurrency(),
                new SettingsDto.BookingPolicy(s.getCancelHoursBefore(), s.getMinNoticeHours(), s.getMaxDaysAhead(),
                        s.getChairs(), s.getBufferMin(), s.getBookingPolicyText()),
                new SettingsDto.DeliveryPolicy(s.getDeliveryCharge(), s.getFreeAbove(), s.getMinOrderValue(), s.getDeliveryText()),
                new SettingsDto.Copy(s.getHeroTitle(), s.getHeroText(), s.getAboutTitle(), about),
                new SettingsDto.Notifications(s.isNotifyBookingEmail(), s.isNotifyOrderEmail()));
    }

    @Transactional
    public SettingsDto update(SettingsDto in) {
        Map<String, String> errors = new HashMap<>();
        StudioSettings s = entity();

        s.setStudioName(in.studioName().trim());
        if (in.tagline() != null) s.setTagline(in.tagline().trim());
        if (in.hoursNote() != null) s.setHoursNote(in.hoursNote().trim());
        if (in.serviceArea() != null) s.setServiceArea(in.serviceArea().trim());
        if (in.currency() != null) s.setCurrency(in.currency().trim().toUpperCase());

        if (in.contact() != null) {
            var c = in.contact();
            s.setPhone(Texts.trim(c.phone()));
            s.setEmail(Texts.trim(c.email()));
            s.setAddress(Texts.trim(c.address()));
            s.setMapUrl(Texts.trim(c.mapUrl()));
        }
        if (in.social() != null) {
            var c = in.social();
            s.setInstagram(Texts.trim(c.instagram()));
            s.setFacebook(Texts.trim(c.facebook()));
            s.setWhatsapp(Texts.trim(c.whatsapp()));
        }
        if (in.bookingPolicy() != null) {
            var b = in.bookingPolicy();
            if (b.cancelHoursBefore() != null) {
                if (b.cancelHoursBefore() < 0 || b.cancelHoursBefore() > 720) errors.put("bookingPolicy.cancelHoursBefore", "Enter a number from 0 to 720.");
                else s.setCancelHoursBefore(b.cancelHoursBefore());
            }
            if (b.minNoticeHours() != null) {
                if (b.minNoticeHours() < 0 || b.minNoticeHours() > 720) errors.put("bookingPolicy.minNoticeHours", "Enter a number from 0 to 720.");
                else s.setMinNoticeHours(b.minNoticeHours());
            }
            if (b.maxDaysAhead() != null) {
                if (b.maxDaysAhead() < 0 || b.maxDaysAhead() > 365) errors.put("bookingPolicy.maxDaysAhead", "Enter a number from 0 to 365.");
                else s.setMaxDaysAhead(b.maxDaysAhead());
            }
            if (b.chairs() != null) {
                if (b.chairs() < 1 || b.chairs() > 20) errors.put("bookingPolicy.chairs", "Enter a number from 1 to 20.");
                else s.setChairs(b.chairs());
            }
            if (b.bufferMin() != null) {
                if (b.bufferMin() < 0 || b.bufferMin() > 240) errors.put("bookingPolicy.bufferMin", "Enter a number from 0 to 240.");
                else s.setBufferMin(b.bufferMin());
            }
            if (b.text() != null) s.setBookingPolicyText(b.text().trim());
        }
        if (in.deliveryPolicy() != null) {
            var d = in.deliveryPolicy();
            if (d.charge() != null && d.charge().signum() < 0) errors.put("deliveryPolicy.charge", "Enter an amount, or leave blank.");
            if (d.freeAbove() != null && d.freeAbove().signum() < 0) errors.put("deliveryPolicy.freeAbove", "Enter an amount, or leave blank.");
            if (d.minOrderValue() != null && d.minOrderValue().signum() < 0) errors.put("deliveryPolicy.minOrderValue", "Enter an amount, or leave blank.");
            if (errors.keySet().stream().noneMatch(k -> k.startsWith("deliveryPolicy"))) {
                s.setDeliveryCharge(d.charge());
                s.setFreeAbove(d.freeAbove());
                s.setMinOrderValue(d.minOrderValue());
            }
            if (d.text() != null) s.setDeliveryText(d.text().trim());
        }
        if (in.copy() != null) {
            var c = in.copy();
            if (c.heroTitle() != null) s.setHeroTitle(c.heroTitle().trim());
            if (c.heroText() != null) s.setHeroText(c.heroText().trim());
            if (c.aboutTitle() != null) s.setAboutTitle(c.aboutTitle().trim());
            if (c.aboutParagraphs() != null) {
                paragraphs.deleteAll(paragraphs.findAll());
                paragraphs.flush();
                List<AboutParagraph> fresh = new ArrayList<>();
                int i = 1;
                for (String p : c.aboutParagraphs()) {
                    if (p != null && !p.isBlank()) fresh.add(new AboutParagraph(i++, p.trim()));
                }
                paragraphs.saveAll(fresh);
            }
        }
        if (in.notifications() != null) {
            if (in.notifications().bookingEmail() != null) s.setNotifyBookingEmail(in.notifications().bookingEmail());
            if (in.notifications().orderEmail() != null) s.setNotifyOrderEmail(in.notifications().orderEmail());
        }

        if (!errors.isEmpty()) {
            throw ApiException.invalid("Please fix the highlighted fields.", errors);
        }
        repo.save(s);
        return get();
    }

    /** Used by the availability editor: the slot interval lives with the other business rules. */
    @Transactional
    public void setSlotInterval(int minutes) {
        StudioSettings s = entity();
        s.setSlotIntervalMin(minutes);
        repo.save(s);
    }
}
