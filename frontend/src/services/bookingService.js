import { USE_MOCK, endpoints } from '../config';
import { api, ApiError } from './apiClient';
import { db, commit, delay, uid, logActivity, copy } from './mock/db';
import { addDays, fromMinutes, minutes, parseISODate, toISODate, todayISO } from '../utils/date';
import { BOOKING_ACTIVE } from '../utils/status';

/* ----------------------------------------------------------------------------
   Real implementation. The server owns availability and validation; the
   frontend only displays what it is told.
---------------------------------------------------------------------------- */

// The Spring API stores only the service id; the sample service list supplies
// the name, duration and price the screens show. Unknown ids fall back safely.
function serviceInfo(serviceId) {
  try {
    return db().services.find((s) => s.id === serviceId) || null;
  } catch {
    return null;
  }
}

// Spring AppointmentResponse -> the booking shape the screens already use.
function fromBackend(a) {
  const svc = serviceInfo(a.serviceId);
  return {
    ...a,
    id: String(a.id),
    serviceName: a.serviceName || svc?.name || 'Appointment',
    durationMin: a.durationMin ?? svc?.durationMin,
    price: a.price ?? svc?.price,
    time: (a.time || '').slice(0, 5), // "10:30:00" -> "10:30"
    notes: a.notes || '',
    adminNote: a.adminNote || '',
    contact: { name: a.contact?.name || '', phone: a.contact?.phone || '', email: a.contact?.email || '' },
  };
}

const real = {
  days: ({ from, to }) =>
    api.get(`${endpoints.availability}/days`, { params: { from, to } }),

  slots: ({ date, serviceId }) =>
    api.get(`${endpoints.availability}/slots`, {
      params: { date, serviceId },
    }),

  // Temporary demo identity; not secure authentication.
  create: async ({ userId, ...payload }) =>
    fromBackend(
      await api.post(endpoints.appointments, {
        ...payload,
        customerId: userId,
      })
    ),

  async listMine({ userId }) {
    const rows = await api.get(endpoints.myAppointments, {
      params: { customerId: userId },
    });
    return (Array.isArray(rows) ? rows : []).map(fromBackend);
  },

  async getMine({ id, userId }) {
    try {
      return fromBackend(
        await api.get(`${endpoints.appointments}/${id}`, {
          params: { customerId: userId },
        })
      );
    } catch (err) {
      if (err.status === 404) return null; // page shows "could not find that booking"
      throw err;
    }
  },

  async cancel({ id, userId }) {
    try {
      return fromBackend(
        await api.post(`${endpoints.appointments}/${id}/cancel`, {
          customerId: userId,
        })
      );
    } catch (err) {
      if (err.status === 409) throw new ApiError('This appointment can no longer be cancelled. Please contact the studio.', { status: 409 });
      if (err.status === 404) throw new ApiError('We could not find that booking.', { status: 404 });
      throw err;
    }
  },
};

/* ----------------------------------------------------------------------------
   Development mode: availability is derived from SAMPLE opening hours in the
   dev store. It is not the real studio's calendar.
---------------------------------------------------------------------------- */
function dayRule(store, iso) {
  const { weekly, blocked } = store.availability;
  const rule = weekly[parseISODate(iso).getDay()];
  const block = blocked.find((b) => iso >= b.start && iso <= b.end);
  return { rule, block };
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export function computeSlots(store, iso, durationMin) {
  const { slotIntervalMin, breaks } = store.availability;
  const { rule, block } = dayRule(store, iso);
  if (!rule?.open || block) return [];

  const { minNoticeHours, chairs } = store.settings.bookingPolicy;
  const now = new Date();
  const cutoff = now.getTime() + minNoticeHours * 3600e3;
  const open = minutes(rule.start);
  const close = minutes(rule.end);
  const taken = store.bookings.filter((b) => b.date === iso && BOOKING_ACTIVE.includes(b.status));

  const slots = [];
  for (let t = open; t + durationMin <= close; t += slotIntervalMin) {
    const end = t + durationMin;
    const time = fromMinutes(t);
    const startsAt = parseISODate(iso);
    startsAt.setHours(Math.floor(t / 60), t % 60, 0, 0);

    let reason = '';
    if (startsAt.getTime() < cutoff) reason = 'Too soon';
    else if (breaks.some((b) => overlaps(t, end, minutes(b.start), minutes(b.end)))) reason = 'Studio break';
    else if (taken.filter((b) => overlaps(t, end, minutes(b.time), minutes(b.time) + b.durationMin)).length >= chairs) reason = 'Booked';
    slots.push({ time, available: !reason, reason });
  }
  return slots;
}

const mock = {
  async days({ from, to }) {
    await delay(140);
    const store = db();
    const { maxDaysAhead } = store.settings.bookingPolicy;
    const limit = toISODate(addDays(new Date(), maxDaysAhead));
    const out = {};
    for (let d = parseISODate(from); toISODate(d) <= to; d = addDays(d, 1)) {
      const iso = toISODate(d);
      const { rule, block } = dayRule(store, iso);
      // A day is only offered if at least one start time is still free for
      // the shortest active service (so "today" is not offered after hours).
      const shortest = Math.min(...store.services.filter((x) => x.active).map((x) => x.durationMin), 60);
      out[iso] = iso >= todayISO() && iso <= limit && !!rule?.open && !block && computeSlots(store, iso, shortest).some((x) => x.available);
    }
    return out;
  },

  async slots({ date, serviceId }) {
    await delay(180);
    const store = db();
    const svc = store.services.find((s) => s.id === serviceId);
    if (!svc) throw new ApiError('Please choose a service first.', { status: 400 });
    return computeSlots(store, date, svc.durationMin);
  },

  async create({ serviceId, date, time, contact, notes, userId }) {
    await delay(380);
    const store = db();
    if (!userId) throw new ApiError('Please sign in to request an appointment.', { status: 401 });
    const svc = store.services.find((s) => s.id === serviceId && s.active);
    if (!svc) throw new ApiError('That service is no longer available.', { status: 400 });
    const slot = computeSlots(store, date, svc.durationMin).find((s) => s.time === time);
    if (!slot?.available) {
      throw new ApiError('That time has just been taken. Please choose another.', { status: 409 });
    }
    const booking = {
      id: `bk_${++store.counters.booking}`,
      userId,
      serviceId: svc.id,
      serviceName: svc.name,
      durationMin: svc.durationMin,
      price: svc.price,
      date,
      time,
      status: 'PENDING',
      contact,
      notes: notes?.trim() || '',
      adminNote: '',
      createdAt: new Date().toISOString(),
      mock: true,
    };
    store.bookings.unshift(booking);
    logActivity('booking', `Booking request: ${svc.name}, ${date} ${time} (sample)`);
    commit();
    return copy(booking);
  },

  async listMine({ userId }) {
    await delay(160);
    return copy(
      db()
        .bookings.filter((b) => b.userId === userId)
        .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    );
  },

  async getMine({ id, userId }) {
    await delay(100);
    const b = db().bookings.find((x) => x.id === id && x.userId === userId);
    return b ? copy(b) : null;
  },

  async cancel({ id, userId }) {
    await delay(260);
    const store = db();
    const b = store.bookings.find((x) => x.id === id && x.userId === userId);
    if (!b) throw new ApiError('Booking not found.', { status: 404 });
    if (!canCancel(b, store.settings).ok) throw new ApiError(canCancel(b, store.settings).reason, { status: 409 });
    b.status = 'CANCELLED';
    logActivity('booking', `Booking cancelled by customer: ${b.serviceName}, ${b.date} (sample)`);
    commit();
    return copy(b);
  },
};

// Cancellation policy, evaluated for display. The server must enforce it too.
export function canCancel(booking, settings) {
  if (!BOOKING_ACTIVE.includes(booking.status)) return { ok: false, reason: 'This booking can no longer be cancelled.' };
  const hours = settings?.bookingPolicy?.cancelHoursBefore ?? 24;
  const start = parseISODate(booking.date);
  const [h, m] = booking.time.split(':').map(Number);
  start.setHours(h, m, 0, 0);
  if (start.getTime() - Date.now() < hours * 3600e3) {
    return { ok: false, reason: `Appointments can be cancelled up to ${hours} hours beforehand. Please contact the studio.` };
  }
  return { ok: true, reason: '' };
}

// Callers always pass { userId }; with the real API the session cookie
// identifies the caller, so it is ignored there.
const USE_REAL_BOOKING_CREATION =
  import.meta.env.VITE_REAL_BOOKING_CREATION === 'true';

// Customer dashboard, booking details and cancellation read the same MySQL
// rows the admin sees. Keep this in step with VITE_REAL_BOOKING_CREATION:
// bookings must be created and read from the same place.
const USE_REAL_APPOINTMENTS =
  import.meta.env.VITE_REAL_APPOINTMENTS === 'true';

export const bookingService = USE_MOCK
  ? {
      ...mock,
      ...(USE_REAL_BOOKING_CREATION ? { create: real.create } : {}),
      ...(USE_REAL_APPOINTMENTS
        ? { listMine: real.listMine, getMine: real.getMine, cancel: real.cancel }
        : {}),
    }
  : real;