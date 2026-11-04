import { BOOKING_STATUS, ORDER_STATUS, PAYMENT_STATUS } from '../../utils/status';

const MAPS = { booking: BOOKING_STATUS, order: ORDER_STATUS, payment: PAYMENT_STATUS };

// Always shows the status as text; colour is reinforcement, never the only cue.
export function StatusBadge({ kind = 'booking', status }) {
  const entry = MAPS[kind][status] || { label: status, tone: 'muted' };
  return <span className={`badge badge--${entry.tone}`}>{entry.label}</span>;
}
