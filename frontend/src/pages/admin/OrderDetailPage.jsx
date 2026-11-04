import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AdminPage } from '../../components/layout/AdminLayout';
import { Section } from '../../components/admin/AdminBits';
import { Button } from '../../components/ui/Button';
import { Confirm } from '../../components/ui/Confirm';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { ErrorState, Loading } from '../../components/ui/States';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Address, OrderItems, OrderTotalsStatic, Timeline } from '../../components/orders/OrderParts';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { usePageMeta } from '../../hooks/usePageMeta';
import { adminService } from '../../services/adminService';
import { formatStamp } from '../../utils/date';
import { ORDER_ACTION_LABEL, ORDER_TRANSITIONS, PAYMENT_STATUS } from '../../utils/status';

const GENTLE = ['CONFIRMED', 'PACKING', 'DISPATCHED', 'DELIVERED'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const { data: order, loading, error, retry, setData } = useAsync(() => adminService.getOrder(id), [id]);
  usePageMeta(order ? `Order ${order.number}` : 'Order');

  const [asking, setAsking] = useState(null);
  const [payment, setPayment] = useState('UNPAID');
  const [tracking, setTracking] = useState({ carrier: '', number: '' });
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    if (order) {
      setPayment(order.paymentStatus);
      setTracking({ carrier: order.tracking?.carrier || '', number: order.tracking?.number || '' });
      setNote(order.adminNote || '');
    }
  }, [order]);

  if (loading) return <Loading block label="Loading the order" />;
  if (error) return <ErrorState error={error} onRetry={retry} />;
  if (!order) return <ErrorState error={new Error('That order could not be found.')} title="Order not found" />;

  const run = async (key, changes, message) => {
    setBusy(key);
    try {
      setData(await adminService.updateOrder({ id: order.id, ...changes }));
      toast(message);
    } catch (err) {
      toast(err.message, { tone: 'bad' });
      throw err;
    } finally {
      setBusy('');
    }
  };

  const moves = ORDER_TRANSITIONS[order.status] || [];
  const detailsChanged = tracking.carrier !== (order.tracking?.carrier || '') || tracking.number !== (order.tracking?.number || '') || note !== (order.adminNote || '');

  return (
    <AdminPage
      title={order.number}
      intro={`Placed ${formatStamp(order.createdAt)} by ${order.customer.name}.`}
      back={
        <Link to="/admin/orders" className="backlink">
          <ArrowLeft size={15} aria-hidden /> All orders
        </Link>
      }
      actions={
        <div className="badge-pair">
          <StatusBadge kind="order" status={order.status} />
          <StatusBadge kind="payment" status={order.paymentStatus} />
        </div>
      }
    >
      <div className="odetail">
        <div className="odetail__main">
          <Section title="Items">
            <OrderItems items={order.items} />
            <OrderTotalsStatic order={order} />
            <p className="muted" style={{ marginTop: 14, marginBottom: 0 }}>The delivery charge is agreed with the customer by hand and is not included unless the studio has set one.</p>
          </Section>

          <Section title="Order progress">
            {moves.length > 0 ? (
              <div className="btn-row">
                {moves.map((m) => (
                  <Button
                    key={m}
                    variant={GENTLE.includes(m) ? 'primary' : 'secondary'}
                    loading={busy === m}
                    onClick={() => (GENTLE.includes(m) ? run(m, { status: m }, `Order marked ${m.toLowerCase()}.`) : setAsking(m))}
                  >
                    {ORDER_ACTION_LABEL[m]}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="muted" style={{ margin: 0 }}>This order is closed; no further status changes are available.</p>
            )}
            <p className="muted" style={{ margin: '16px 0 18px' }}>Declining or cancelling returns the items to stock.</p>
            <Timeline history={order.history} />
          </Section>
        </div>

        <div className="odetail__side">
          <Section title="Payment">
            <p className="muted" style={{ marginTop: 0 }}>Payment is recorded by hand, separately from the order status. Nothing is taken on the website.</p>
            <Select label="Payment status" value={payment} onChange={(e) => setPayment(e.target.value)} options={Object.entries(PAYMENT_STATUS).map(([value, v]) => ({ value, label: v.label }))} />
            <Button style={{ marginTop: 16 }} variant="secondary" disabled={payment === order.paymentStatus} loading={busy === 'pay'} onClick={() => run('pay', { paymentStatus: payment }, 'Payment status saved.')}>
              Save payment status
            </Button>
          </Section>

          <Section title="Customer">
            <p style={{ marginBottom: 14 }}>
              <strong>{order.customer.name}</strong>
              <br />
              {order.customer.phone}
              <br />
              {order.customer.email}
            </p>
            <Address shipping={order.shipping} />
          </Section>

          <Section title="Tracking & notes">
            <div className="stack">
              <Input label="Courier" optional value={tracking.carrier} onChange={(e) => setTracking({ ...tracking, carrier: e.target.value })} />
              <Input label="Tracking number" optional value={tracking.number} onChange={(e) => setTracking({ ...tracking, number: e.target.value })} />
              <Textarea label="Private note" optional rows={3} value={note} onChange={(e) => setNote(e.target.value)} hint="Only you can see this." />
              <div>
                <Button variant="secondary" disabled={!detailsChanged} loading={busy === 'details'} onClick={() => run('details', { tracking, adminNote: note }, 'Details saved.')}>
                  Save details
                </Button>
              </div>
            </div>
          </Section>
        </div>
      </div>

      <Confirm
        open={!!asking}
        title={asking ? `${ORDER_ACTION_LABEL[asking]}?` : ''}
        message={`Order ${order.number} will be closed and its items returned to stock. The customer will see the new status.`}
        confirmLabel={asking ? ORDER_ACTION_LABEL[asking] : ''}
        tone="danger"
        onConfirm={() => run(asking, { status: asking }, 'Order updated.')}
        onClose={() => setAsking(null)}
      />
    </AdminPage>
  );
}
