import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminPage } from '../../components/layout/AdminLayout';
import { Section, Stat } from '../../components/admin/AdminBits';
import { Button } from '../../components/ui/Button';
import { Confirm } from '../../components/ui/Confirm';
import { ErrorState, Loading } from '../../components/ui/States';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { usePageMeta } from '../../hooks/usePageMeta';
import { adminService } from '../../services/adminService';
import { formatDate, formatStamp, formatTime } from '../../utils/date';
import { formatPrice } from '../../utils/format';

export default function DashboardPage() {
  usePageMeta('Dashboard');
  const toast = useToast();
  const { data, loading, error, retry, reload } = useAsync(() => adminService.overview(), []);
  const [declining, setDeclining] = useState(null);

  const act = async (b, status) => {
    try {
      await adminService.setAppointmentStatus({ id: b.id, status });
      toast(status === 'APPROVED' ? 'Appointment approved.' : 'Request declined.');
      reload();
    } catch (err) {
      toast(err.message, { tone: 'bad' });
      throw err;
    }
  };

  return (
    <AdminPage title="Overview" intro="What needs your attention today.">
      {loading && <Loading block label="Loading the overview" />}
      {error && <ErrorState error={error} onRetry={retry} />}
      {data && (
        <>
          <div className="stats">
            <Stat label="Pending requests" value={data.pendingAppointments.length} hint="Appointments to approve" to="/admin/appointments" alert={data.pendingAppointments.length > 0} />
            <Stat label="Today" value={data.todaysAppointments.length} hint="Appointments today" to="/admin/appointments" />
            <Stat label="New orders" value={data.newOrders} hint="In the last 3 days" to="/admin/orders" />
            <Stat label="Awaiting confirmation" value={data.awaitingOrders.length} hint="Orders to confirm" to="/admin/orders" alert={data.awaitingOrders.length > 0} />
            <Stat label="Low stock" value={data.lowStock.length} hint="Variants with 2 or fewer" to="/admin/products" alert={data.lowStock.length > 0} />
          </div>

          <div className="dash">
            <Section title="Appointment requests" action={<Link to="/admin/appointments" className="btn btn--link">All appointments</Link>}>
              {data.pendingAppointments.length === 0 ? (
                <p className="muted">No requests are waiting.</p>
              ) : (
                <ul className="alist">
                  {data.pendingAppointments.map((b) => (
                    <li key={b.id}>
                      <div>
                        <strong>{b.serviceName}</strong>
                        <span>
                          {b.contact.name} · {formatDate(b.date)} · {formatTime(b.time)}
                        </span>
                      </div>
                      <div className="btn-row">
                        <Button size="sm" onClick={() => act(b, 'APPROVED')}>Approve</Button>
                        <Button size="sm" variant="secondary" onClick={() => setDeclining(b)}>Decline</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="Today’s appointments">
              {data.todaysAppointments.length === 0 ? (
                <p className="muted">Nothing scheduled for today.</p>
              ) : (
                <ul className="alist">
                  {data.todaysAppointments.map((b) => (
                    <li key={b.id}>
                      <div>
                        <strong>
                          {formatTime(b.time)} · {b.serviceName}
                        </strong>
                        <span>{b.contact.name}</span>
                      </div>
                      <StatusBadge kind="booking" status={b.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="Orders awaiting confirmation" action={<Link to="/admin/orders" className="btn btn--link">All orders</Link>}>
              {data.awaitingOrders.length === 0 ? (
                <p className="muted">All orders are confirmed.</p>
              ) : (
                <ul className="alist">
                  {data.awaitingOrders.map((o) => (
                    <li key={o.id}>
                      <div>
                        <strong>{o.number}</strong>
                        <span>
                          {o.customer.name} · {formatPrice(o.total)} · {formatStamp(o.createdAt)}
                        </span>
                      </div>
                      <Button as={Link} to={`/admin/orders/${o.id}`} size="sm" variant="secondary">Review</Button>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="Low stock" action={<Link to="/admin/products" className="btn btn--link">Products</Link>}>
              {data.lowStock.length === 0 ? (
                <p className="muted">Every variant has healthy stock.</p>
              ) : (
                <ul className="alist">
                  {data.lowStock.slice(0, 6).map((s) => (
                    <li key={`${s.productId}-${s.variant}`}>
                      <div>
                        <strong>{s.name}</strong>
                        <span>{s.variant}</span>
                      </div>
                      <span className={`pill ${s.stock === 0 ? 'pill--bad' : 'pill--warn'}`}>{s.stock === 0 ? 'Out of stock' : `${s.stock} left`}</span>
                    </li>
                  ))}
                </ul>
              )}
              {data.lowStock.length > 6 && <p className="muted" style={{ margin: '14px 0 0' }}>and {data.lowStock.length - 6} more variants. <Link to="/admin/products">See all products</Link></p>}
            </Section>

            <Section title="Recent activity" className="dash__wide">
              <ul className="activity">
                {data.activity.map((a) => (
                  <li key={a.id}>
                    <span>{a.text}</span>
                    <time dateTime={a.at}>{formatStamp(a.at)}</time>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </>
      )}

      <Confirm
        open={!!declining}
        title="Decline this request?"
        message={declining ? `${declining.contact.name}’s request for ${declining.serviceName} on ${formatDate(declining.date)} will be declined.` : ''}
        confirmLabel="Decline request"
        tone="danger"
        onConfirm={() => act(declining, 'REJECTED')}
        onClose={() => setDeclining(null)}
      />
    </AdminPage>
  );
}
