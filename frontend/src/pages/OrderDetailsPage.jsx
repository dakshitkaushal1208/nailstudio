import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { EmptyState, ErrorState, Loading } from '../components/ui/States';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Address, OrderItems, OrderTotalsStatic, Timeline } from '../components/orders/OrderParts';
import { useAuth } from '../context/AuthContext';
import { useStudio } from '../context/StudioContext';
import { useAsync } from '../hooks/useAsync';
import { usePageMeta } from '../hooks/usePageMeta';
import { orderService } from '../services/orderService';
import { formatStamp } from '../utils/date';

const STATUS_COPY = {
  PLACED: 'The studio has your request and will contact you to confirm it.',
  CONFIRMED: 'Confirmed. The studio will arrange payment and delivery with you.',
  PACKING: 'Your set is being packed.',
  DISPATCHED: 'Your set is on its way.',
  DELIVERED: 'Delivered. We hope you love it.',
  REJECTED: 'The studio could not take this order. Please contact them if you have questions.',
  CANCELLED: 'This order was cancelled.',
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { settings } = useStudio();
  const { data: order, loading, error, retry } = useAsync(() => orderService.getMine({ id, userId: user.id }), [id]);
  usePageMeta(order ? `Order ${order.number}` : 'Order');

  if (loading) return <Loading block label="Loading your order" />;
  if (error) return <div className="container"><ErrorState error={error} onRetry={retry} /></div>;
  if (!order) {
    return (
      <div className="container section">
        <EmptyState title="We could not find that order" action={<Button as={Link} to="/my-orders" variant="secondary">Back to my orders</Button>}>
          It may belong to another account.
        </EmptyState>
      </div>
    );
  }
  const contact = settings?.contact || {};

  return (
    <div className="container">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/my-orders">My orders</Link>
        <span aria-hidden>/</span>
        <span aria-current="page">{order.number}</span>
      </nav>
      <header className="page-head" style={{ paddingTop: 12 }}>
        <p className="eyebrow">Order</p>
        <h1 className="h-page">
          {order.number}
        </h1>
        <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <StatusBadge kind="order" status={order.status} />
          <StatusBadge kind="payment" status={order.paymentStatus} />
          <span className="muted">Placed {formatStamp(order.createdAt)}</span>
        </p>
        <p className="lede">{STATUS_COPY[order.status]}</p>
        {order.mock && <p className="sample-note">Sample order created in development mode.</p>}
      </header>

      <div className="detail-grid">
        <section className="panel">
          <h2 className="panel__title">Items</h2>
          <OrderItems items={order.items} />
          <OrderTotalsStatic order={order} />
        </section>
        <div className="detail-grid__side">
          <section className="panel">
            <h2 className="panel__title">Delivery</h2>
            <Address shipping={order.shipping} />
            {order.tracking?.number ? (
              <dl className="kv" style={{ marginTop: 20 }}>
                <dt>Courier</dt>
                <dd>{order.tracking.carrier || 'Not given'}</dd>
                <dt>Tracking</dt>
                <dd>{order.tracking.number}</dd>
              </dl>
            ) : (
              <p className="muted" style={{ marginTop: 16, marginBottom: 0 }}>Tracking details will appear here once the order is dispatched.</p>
            )}
          </section>
          <section className="panel">
            <h2 className="panel__title">Progress</h2>
            <Timeline history={order.history} />
          </section>
          <section className="panel panel--quiet">
            <h2 className="panel__title">Questions?</h2>
            <p className="muted" style={{ marginBottom: 0 }}>
              {contact.phone || contact.email ? (
                <>Contact the studio on {[contact.phone, contact.email].filter(Boolean).join(' or ')}, quoting {order.number}.</>
              ) : (
                <>Studio contact details will be shown here once they are added.</>
              )}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
