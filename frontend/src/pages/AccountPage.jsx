import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Field';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Loading } from '../components/ui/States';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { usePageMeta } from '../hooks/usePageMeta';
import { bookingService } from '../services/bookingService';
import { orderService } from '../services/orderService';
import { formatDate, formatStamp, formatTime, todayISO } from '../utils/date';
import { formatPrice } from '../utils/format';
import { isPhone } from '../utils/validate';
import { BOOKING_ACTIVE } from '../utils/status';

function Profile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const dirty = form.name.trim() !== user.name || form.phone.trim() !== (user.phone || '');

  const save = async (e) => {
    e.preventDefault();
    const next = {
      name: form.name.trim().length < 2 ? 'Enter your name.' : '',
      phone: form.phone.trim() && !isPhone(form.phone) ? 'Enter a valid 10-digit mobile number.' : '',
    };
    setErrors(next);
    if (next.name || next.phone) return;
    setBusy(true);
    try {
      await updateProfile(form);
      toast('Your details were updated.');
    } catch (err) {
      toast(err.message, { tone: 'bad' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} noValidate className="panel">
      <h2 className="panel__title">Your details</h2>
      <div className="form-grid">
        <Input wrapperClass="span-2" label="Full name" value={form.name} error={errors.name} autoComplete="name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Email" value={user.email} readOnly disabled hint="Your email is your sign-in and cannot be changed here." />
        <Input label="Phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} error={errors.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div className="btn-row" style={{ marginTop: 24 }}>
        <Button type="submit" loading={busy} disabled={!dirty}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

function Glance({ title, to, linkLabel, loading, empty, children }) {
  return (
    <section className="panel">
      <div className="panel__head">
        <h2 className="panel__title">{title}</h2>
        <Link to={to} className="btn btn--link">
          {linkLabel}
        </Link>
      </div>
      {loading ? <Loading label="Loading" /> : children || <p className="muted" style={{ marginBottom: 0 }}>{empty}</p>}
    </section>
  );
}

export default function AccountPage() {
  usePageMeta('Your account');
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const orders = useAsync(() => orderService.listMine({ userId: user.id }), []);
  const bookings = useAsync(() => bookingService.listMine({ userId: user.id }), []);

  const today = todayISO();
  const nextBookings = (bookings.data || [])
    .filter((b) => BOOKING_ACTIVE.includes(b.status) && b.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 3);
  const recentOrders = (orders.data || []).slice(0, 3);

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">Your account</p>
        <h1 className="h-page">
          Hello, <em>{user.name.split(' ')[0]}.</em>
        </h1>
        <p className="lede">Your appointment requests, orders and details, in one place.</p>
      </header>

      <div className="account">
        <div className="account__main">
          <Glance title="Upcoming appointments" to="/my-bookings" linkLabel="All bookings" loading={bookings.loading} empty="No upcoming appointments.">
            {nextBookings.length > 0 && (
              <ul className="mini">
                {nextBookings.map((b) => (
                  <li key={b.id}>
                    <Link to={`/my-bookings/${b.id}`}>
                      <span>
                        <strong>{b.serviceName}</strong>
                        <small>
                          {formatDate(b.date)} · {formatTime(b.time)}
                        </small>
                      </span>
                      <StatusBadge kind="booking" status={b.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Glance>

          <Glance title="Recent orders" to="/my-orders" linkLabel="All orders" loading={orders.loading} empty="You have not placed an order yet.">
            {recentOrders.length > 0 && (
              <ul className="mini">
                {recentOrders.map((o) => (
                  <li key={o.id}>
                    <Link to={`/my-orders/${o.id}`}>
                      <span>
                        <strong>{o.number}</strong>
                        <small>
                          {formatStamp(o.createdAt)} · {formatPrice(o.total)}
                        </small>
                      </span>
                      <span className="mini__badges">
                        <StatusBadge kind="order" status={o.status} />
                        <StatusBadge kind="payment" status={o.paymentStatus} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Glance>
        </div>

        <div className="account__side">
          <Profile />
          <section className="panel panel--quiet">
            <h2 className="panel__title">Quick links</h2>
            <ul className="links">
              <li><Link to="/book">Request an appointment <ArrowRight size={15} aria-hidden /></Link></li>
              <li><Link to="/shop">Browse press-on nails <ArrowRight size={15} aria-hidden /></Link></li>
              {isAdmin && <li><Link to="/admin">Studio dashboard <ArrowRight size={15} aria-hidden /></Link></li>}
            </ul>
            <Button
              variant="secondary"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
            >
              Sign out
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
