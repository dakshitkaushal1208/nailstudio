import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Confirm } from '../components/ui/Confirm';
import { EmptyState, ErrorState, Loading } from '../components/ui/States';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useStudio } from '../context/StudioContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { usePageMeta } from '../hooks/usePageMeta';
import { bookingService, canCancel } from '../services/bookingService';
import { formatDateLong, formatDuration, formatStamp, formatTime } from '../utils/date';
import { formatPrice } from '../utils/format';

const COPY = {
  PENDING: 'Your request is with the studio. It is not a confirmed appointment until it is approved. You will see the status change here.',
  APPROVED: 'Approved. Your appointment is confirmed for the time below.',
  REJECTED: 'The studio could not accept this time. You are welcome to request another.',
  CANCELLED: 'This appointment was cancelled.',
  COMPLETED: 'This appointment is complete. Thank you for visiting.',
};

export default function BookingDetailsPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { settings } = useStudio();
  const toast = useToast();
  const [asking, setAsking] = useState(false);
  const { data: booking, loading, error, retry, setData } = useAsync(() => bookingService.getMine({ id, userId: user.id }), [id]);
  usePageMeta('Booking details');

  if (loading) return <Loading block label="Loading your booking" />;
  if (error) return <div className="container"><ErrorState error={error} onRetry={retry} /></div>;
  if (!booking) {
    return (
      <div className="container section">
        <EmptyState title="We could not find that booking" action={<Button as={Link} to="/my-bookings" variant="secondary">Back to my bookings</Button>}>
          It may belong to another account.
        </EmptyState>
      </div>
    );
  }

  const rule = canCancel(booking, settings);
  const isNew = params.get('new') === '1';

  const cancel = async () => {
    try {
      const updated = await bookingService.cancel({ id: booking.id, userId: user.id });
      setData(updated);
      toast('Your appointment has been cancelled.');
    } catch (err) {
      toast(err.message, { tone: 'bad' });
      throw err;
    }
  };

  return (
    <div className="container">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/my-bookings">My bookings</Link>
        <span aria-hidden>/</span>
        <span aria-current="page">{booking.serviceName}</span>
      </nav>

      <header className="page-head" style={{ paddingTop: 12 }}>
        {isNew && (
          <p className="notice" role="status" style={{ marginBottom: 28 }}>
            <Check size={18} aria-hidden />
            <span>Request sent. Thank you: the studio will review it and the status below will update.</span>
          </p>
        )}
        <p className="eyebrow">Appointment</p>
        <h1 className="h-page">{booking.serviceName}</h1>
        <p style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <StatusBadge kind="booking" status={booking.status} />
          <span className="muted">Requested {formatStamp(booking.createdAt)}</span>
        </p>
        <p className="lede">{COPY[booking.status]}</p>
        {booking.mock && <p className="sample-note">Sample booking created in development mode.</p>}
      </header>

      <div className="detail-grid">
        <section className="panel">
          <h2 className="panel__title">Appointment</h2>
          <dl className="kv">
            <dt>Date</dt>
            <dd>{formatDateLong(booking.date)}</dd>
            <dt>Time</dt>
            <dd>{formatTime(booking.time)}</dd>
            <dt>Duration</dt>
            <dd>About {formatDuration(booking.durationMin)}</dd>
            {typeof booking.price === 'number' && (
              <>
                <dt>Price</dt>
                <dd>From {formatPrice(booking.price)} (confirmed by the studio)</dd>
              </>
            )}
            {booking.notes && (
              <>
                <dt>Your notes</dt>
                <dd>{booking.notes}</dd>
              </>
            )}
            {booking.adminNote && (
              <>
                <dt>From the studio</dt>
                <dd>{booking.adminNote}</dd>
              </>
            )}
          </dl>
        </section>
        <div className="detail-grid__side">
          <section className="panel">
            <h2 className="panel__title">Contact on this request</h2>
            <p style={{ marginBottom: 0 }}>
              {booking.contact.name}
              <br />
              {booking.contact.phone}
              <br />
              {booking.contact.email}
            </p>
          </section>
          {['PENDING', 'APPROVED'].includes(booking.status) && (
            <section className="panel panel--quiet">
              <h2 className="panel__title">Need to change plans?</h2>
              <p className="muted">{settings?.bookingPolicy?.text}</p>
              <Button variant="secondary" onClick={() => setAsking(true)} disabled={!rule.ok}>
                Cancel this {booking.status === 'PENDING' ? 'request' : 'appointment'}
              </Button>
              {!rule.ok && <p className="field__error" style={{ marginTop: 10 }}>{rule.reason}</p>}
            </section>
          )}
        </div>
      </div>

      <Confirm
        open={asking}
        title="Cancel this appointment?"
        message={`${booking.serviceName} on ${formatDateLong(booking.date)} at ${formatTime(booking.time)} will be cancelled and the time released.`}
        confirmLabel="Yes, cancel it"
        tone="danger"
        onConfirm={cancel}
        onClose={() => setAsking(false)}
      />
    </div>
  );
}
