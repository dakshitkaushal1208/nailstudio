// Status vocabularies shared by customer and admin screens.
// `tone` maps to a badge style in ui.css (all within the brand palette).

export const BOOKING_STATUS = {
  PENDING: { label: 'Awaiting approval', tone: 'pending' },
  APPROVED: { label: 'Approved', tone: 'ok' },
  REJECTED: { label: 'Declined', tone: 'bad' },
  CANCELLED: { label: 'Cancelled', tone: 'muted' },
  COMPLETED: { label: 'Completed', tone: 'done' },
};

export const ORDER_STATUS = {
  PLACED: { label: 'Awaiting confirmation', tone: 'pending' },
  CONFIRMED: { label: 'Confirmed', tone: 'ok' },
  REJECTED: { label: 'Declined', tone: 'bad' },
  PACKING: { label: 'Being packed', tone: 'ok' },
  DISPATCHED: { label: 'Dispatched', tone: 'ok' },
  DELIVERED: { label: 'Delivered', tone: 'done' },
  CANCELLED: { label: 'Cancelled', tone: 'muted' },
};

export const PAYMENT_STATUS = {
  UNPAID: { label: 'Unpaid', tone: 'pending' },
  PAID: { label: 'Paid', tone: 'done' },
  REFUNDED: { label: 'Refunded', tone: 'muted' },
};

// Which order-status moves the owner can make from each state.
export const ORDER_TRANSITIONS = {
  PLACED: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['PACKING', 'CANCELLED'],
  PACKING: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['DELIVERED'],
  DELIVERED: [],
  REJECTED: [],
  CANCELLED: [],
};

export const ORDER_ACTION_LABEL = {
  CONFIRMED: 'Confirm order',
  REJECTED: 'Decline order',
  PACKING: 'Start packing',
  DISPATCHED: 'Mark dispatched',
  DELIVERED: 'Mark delivered',
  CANCELLED: 'Cancel order',
};

export const BOOKING_ACTIVE = ['PENDING', 'APPROVED'];
