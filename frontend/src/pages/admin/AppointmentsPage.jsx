import { useMemo, useState } from 'react';
import { CalendarDays, List } from 'lucide-react';
import { AdminPage } from '../../components/layout/AdminLayout';
import { Toolbar } from '../../components/admin/AdminBits';
import { Calendar } from '../../components/bookings/Calendar';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { EmptyState, ErrorState, Loading } from '../../components/ui/States';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { usePageMeta } from '../../hooks/usePageMeta';
import { adminService } from '../../services/adminService';
import { formatDate, formatDateLong, formatDuration, formatStamp, formatTime, todayISO } from '../../utils/date';
import { formatPrice } from '../../utils/format';
import { BOOKING_STATUS } from '../../utils/status';

const STATUS_OPTIONS = Object.entries(BOOKING_STATUS).map(([value, v]) => ({ value, label: v.label }));
const VERB = { APPROVED: 'Approve', REJECTED: 'Decline', CANCELLED: 'Cancel appointment', COMPLETED: 'Mark completed' };

function Detail({ booking, onClose, onDone }) {
  const toast = useToast();
  const [asking, setAsking] = useState(null);
  const [note, setNote] = useState(booking.adminNote || '');
  const [busy, setBusy] = useState(false);

  const moves = [];
  if (booking.status === 'PENDING') moves.push('APPROVED', 'REJECTED', 'CANCELLED');
  if (booking.status === 'APPROVED') {
    if (booking.date <= todayISO()) moves.push('COMPLETED');
    moves.push('CANCELLED');
  }

  const apply = async (status) => {
    setBusy(true);
    try {
      await adminService.setAppointmentStatus({ id: booking.id, status, note });
      toast(`${BOOKING_STATUS[status].label}.`);
      onDone();
    } catch (err) {
      toast(err.message, { tone: 'bad' });
      setBusy(false);
    }
  };

  const destructive = (s) => s === 'REJECTED' || s === 'CANCELLED';

  return (
    <Modal open onClose={onClose} title={booking.serviceName} size="md">
      <p style={{ marginTop: -6 }}>
        <StatusBadge kind="booking" status={booking.status} />
      </p>
      <dl className="kv">
        <dt>When</dt>
        <dd>
          {formatDateLong(booking.date)}, {formatTime(booking.time)} · {formatDuration(booking.durationMin)}
        </dd>
        <dt>Customer</dt>
        <dd>{booking.contact.name}</dd>
        <dt>Phone</dt>
        <dd>{booking.contact.phone}</dd>
        <dt>Email</dt>
        <dd>{booking.contact.email}</dd>
        {typeof booking.price === 'number' && (
          <>
            <dt>From</dt>
            <dd>{formatPrice(booking.price)}</dd>
          </>
        )}
        <dt>Requested</dt>
        <dd>{formatStamp(booking.createdAt)}</dd>
        {booking.notes && (
          <>
            <dt>Customer notes</dt>
            <dd>{booking.notes}</dd>
          </>
        )}
      </dl>

      {moves.length > 0 && (
        <div className="modal-actions">
          <Textarea label="Note for the customer" optional rows={2} value={note} onChange={(e) => setNote(e.target.value)} hint="Shown on their booking page." />
          {asking ? (
            <div className="notice notice--bad" role="alert">
              <p>
                {VERB[asking]}? This cannot be undone from here.
                <span className="btn-row" style={{ marginTop: 12 }}>
                  <Button size="sm" variant="danger" loading={busy} onClick={() => apply(asking)}>Yes, {VERB[asking].toLowerCase()}</Button>
                  <Button size="sm" variant="ghost" onClick={() => setAsking(null)} disabled={busy}>Back</Button>
                </span>
              </p>
            </div>
          ) : (
            <div className="btn-row">
              {moves.map((m) => (
                <Button key={m} variant={m === 'APPROVED' || m === 'COMPLETED' ? 'primary' : 'secondary'} loading={busy && !destructive(m)} onClick={() => (destructive(m) ? setAsking(m) : apply(m))}>
                  {VERB[m]}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default function AppointmentsPage() {
  usePageMeta('Appointments');
  const { data, loading, error, retry, reload } = useAsync(() => adminService.listAppointments({}), []);
  const [view, setView] = useState('list');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [open, setOpen] = useState(null);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const shown = useMemo(() => (data || []).filter((b) => (!status || b.status === status) && (!date || b.date === date)), [data, status, date]);
  const byDay = useMemo(() => {
    const map = {};
    (data || [])
      .filter((b) => !status || b.status === status)
      .forEach((b) => (map[b.date] = [...(map[b.date] || []), b]));
    Object.values(map).forEach((list) => list.sort((a, b) => a.time.localeCompare(b.time)));
    return map;
  }, [data, status]);

  const pending = (data || []).filter((b) => b.status === 'PENDING').length;
  const current = open && (data || []).find((b) => b.id === open);

  return (
    <AdminPage title="Appointments" intro={pending ? `${pending} request${pending === 1 ? ' is' : 's are'} waiting for your decision.` : 'Review and manage appointment requests.'}>
      <Toolbar>
        <div className="seg" role="group" aria-label="View">
          <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>
            <List size={16} aria-hidden /> List
          </button>
          <button type="button" aria-pressed={view === 'calendar'} onClick={() => setView('calendar')}>
            <CalendarDays size={16} aria-hidden /> Calendar
          </button>
        </div>
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS} placeholder="All statuses" wrapperClass="toolbar__field" />
        {view === 'list' && <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} wrapperClass="toolbar__field" />}
        {(status || date) && (
          <Button variant="ghost" onClick={() => { setStatus(''); setDate(''); }}>
            Clear filters
          </Button>
        )}
      </Toolbar>

      {loading && <Loading block label="Loading appointments" />}
      {error && <ErrorState error={error} onRetry={retry} />}

      {data && view === 'list' &&
        (shown.length === 0 ? (
          <EmptyState title="No appointments match">Try clearing the filters.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {shown.map((b) => (
                  <tr key={b.id}>
                    <td className="t-strong">
                      {formatDate(b.date)}
                      <br />
                      <span className="muted">{formatTime(b.time)}</span>
                    </td>
                    <td>
                      {b.contact.name}
                      <br />
                      <span className="muted">{b.contact.phone}</span>
                    </td>
                    <td>{b.serviceName}</td>
                    <td>
                      <StatusBadge kind="booking" status={b.status} />
                    </td>
                    <td className="t-right">
                      <Button size="sm" variant={b.status === 'PENDING' ? 'primary' : 'secondary'} onClick={() => setOpen(b.id)}>
                        {b.status === 'PENDING' ? 'Review' : 'Details'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {data && view === 'calendar' && (
        <Calendar
          month={month}
          onMonth={setMonth}
          selectable={() => true}
          className="cal--admin"
          renderDay={(iso, d, inMonth) => (
            <div className={`acal ${inMonth ? '' : 'is-out'}`}>
              <span className="acal__n">{d.getDate()}</span>
              {(byDay[iso] || []).slice(0, 3).map((b) => (
                <button key={b.id} type="button" className={`acal__item acal__item--${b.status.toLowerCase()}`} onClick={() => setOpen(b.id)} title={`${b.serviceName}, ${b.contact.name}`}>
                  {formatTime(b.time).replace(' ', '')} {b.contact.name.split(' ')[0]}
                </button>
              ))}
              {(byDay[iso] || []).length > 3 && <span className="acal__more">+{byDay[iso].length - 3} more</span>}
            </div>
          )}
        />
      )}

      {current && (
        <Detail
          key={current.id + current.status}
          booking={current}
          onClose={() => setOpen(null)}
          onDone={() => {
            setOpen(null);
            reload();
          }}
        />
      )}
    </AdminPage>
  );
}
