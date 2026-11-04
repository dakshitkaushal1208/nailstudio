import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState, ErrorState, Loading } from '../components/ui/States';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { usePageMeta } from '../hooks/usePageMeta';
import { bookingService } from '../services/bookingService';
import { formatDate, formatTime, todayISO } from '../utils/date';
import { formatPrice } from '../utils/format';
import { BOOKING_ACTIVE } from '../utils/status';

export function BookingRow({ booking }) {
  const [, month, day] = booking.date.split('-');
  return (
    <Link to={`/my-bookings/${booking.id}`} className="row">
      <div className="row__date" aria-hidden>
        <span>{new Date(booking.date + 'T00:00').toLocaleDateString('en-IN', { month: 'short' })}</span>
        <strong>{Number(day)}</strong>
      </div>
      <div className="row__main">
        <p className="row__title">
          {booking.serviceName}
          {booking.mock && <span className="row__sample">sample</span>}
        </p>
        <p className="row__sub">
          {formatDate(booking.date)} · {formatTime(booking.time)}
          {typeof booking.price === 'number' && <> · from {formatPrice(booking.price)}</>}
        </p>
      </div>
      <div className="row__status">
        <StatusBadge kind="booking" status={booking.status} />
      </div>
      <ChevronRight size={20} strokeWidth={1.4} aria-hidden className="row__go" />
    </Link>
  );
}

export default function MyBookingsPage() {
  usePageMeta('My bookings');
  const { user } = useAuth();
  const [tab, setTab] = useState('upcoming');
  const { data, loading, error, retry } = useAsync(() => bookingService.listMine({ userId: user.id }), []);

  const today = todayISO();
  const upcoming = (data || []).filter((b) => BOOKING_ACTIVE.includes(b.status) && b.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const past = (data || []).filter((b) => !upcoming.includes(b));
  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">Your account</p>
        <h1 className="h-page">
          My <em>bookings.</em>
        </h1>
      </header>

      {loading && <Loading block label="Loading your bookings" />}
      {error && <ErrorState error={error} onRetry={retry} />}
      {data && (
        <>
          <div className="tabs" role="tablist" aria-label="Bookings" style={{ marginBottom: 28 }}>
            {[
              ['upcoming', `Upcoming (${upcoming.length})`],
              ['past', `Past & closed (${past.length})`],
            ].map(([key, label]) => (
              <button key={key} type="button" role="tab" className="tab" aria-selected={tab === key} onClick={() => setTab(key)}>
                {label}
              </button>
            ))}
          </div>
          {list.length === 0 ? (
            <EmptyState
              title={tab === 'upcoming' ? 'No upcoming appointments' : 'Nothing here yet'}
              action={tab === 'upcoming' && <Button as={Link} to="/book">Request an appointment</Button>}
            >
              {tab === 'upcoming' ? 'When you send a request it will appear here with its status.' : 'Completed, cancelled and declined appointments are kept here.'}
            </EmptyState>
          ) : (
            <ul className="rows">
              {list.map((b) => (
                <li key={b.id}>
                  <BookingRow booking={b} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
