// SAMPLE studio configuration. Nothing here is a statement about the real
// business: contact details are intentionally blank and copy is placeholder
// wording meant to be rewritten by the owner in Admin → Settings.

export const seedSettings = {
studioName: 'Cute Icles',
  tagline: 'Nail art & press-on sets',
  contact: { phone: '', email: '', address: '', mapUrl: '' },
  social: { instagram: '', facebook: '', whatsapp: '' },
  hoursNote: '',
  bookingPolicy: {
    cancelHoursBefore: 24,
    minNoticeHours: 12,
    maxDaysAhead: 60,
    chairs: 1,
    text:
      'Requests are held until the studio approves them. You can cancel a request, or an approved appointment, up to 24 hours beforehand.',
  },
  deliveryPolicy: {
    charge: null, // null = "confirmed by the studio"; a number shows a fixed delivery fee
    freeAbove: null,
    text:
      'Delivery is arranged by hand. Once the studio confirms your order it will contact you about payment and the delivery charge for your address.',
  },
  copy: {
    heroTitle: 'Beautiful nails. Thoughtfully crafted.',
    heroText:
      'Appointments for hand-finished nail art, and ready-made press-on sets for the days you cannot be in the chair.',
    aboutTitle: 'A quiet room, a careful hand.',
    aboutParagraphs: [
      'Placeholder copy. Tell visitors how the studio works: how you approach shape and finish, what an appointment feels like, and what you want every set to do for the person wearing it.',
      'Press-on sets are made in the same spirit as salon work, so a ready-to-wear set still feels considered. Replace this text in Admin → Settings.',
    ],
  },
};

const day = (open, start = '10:00', end = '19:00') => ({ open, start, end });

export const seedAvailability = {
  slotIntervalMin: 30,
  weekly: {
    0: day(false),
    1: day(false),
    2: day(true),
    3: day(true),
    4: day(true),
    5: day(true),
    6: day(true, '10:00', '18:00'),
  },
  breaks: [{ id: 'brk_lunch', start: '13:30', end: '14:30', label: 'Lunch' }],
  blocked: [],
};
