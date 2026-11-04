import { Link, useParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ErrorState, EmptyState, Loading } from '../components/ui/States';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Address, ManualProcessNote, OrderItems, OrderTotalsStatic } from '../components/orders/OrderParts';
import { useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { usePageMeta } from '../hooks/usePageMeta';
import { orderService } from '../services/orderService';
import { formatStamp } from '../utils/date';

export default function OrderConfirmationPage() {
  usePageMeta('Order received');
  const { orderId } = useParams();
  const { user } = useAuth();
  const { data: order, loading, error, retry } = useAsync(() => orderService.getMine({ id: orderId, userId: user.id }), [orderId]);

  if (loading) return <Loading block label="Loading your order" />;
  if (error) return <div className="container"><ErrorState error={error} onRetry={retry} /></div>;
  if (!order) {
    return (
      <div className="container section">
        <EmptyState title="We could not find that order" action={<Button as={Link} to="/my-orders" variant="secondary">View my orders</Button>}>
          If you just placed it, please check My Orders.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container section--tight">
      <div className="confirm">
        <span className="confirm__mark">
          <Check size={26} strokeWidth={1.4} aria-hidden />
        </span>
        <p className="eyebrow">Order request received</p>
        <h1 className="h-page">
          Thank you, <em>{order.customer.name.split(' ')[0]}.</em>
        </h1>
        <p className="lede">
          Your request <strong>{order.number}</strong> is with the studio. It is not confirmed or paid yet: the studio will contact you on {order.shipping.phone} to confirm it and arrange payment and delivery.
        </p>
        <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <StatusBadge kind="order" status={order.status} />
          <StatusBadge kind="payment" status={order.paymentStatus} />
          <span className="muted">Sent {formatStamp(order.createdAt)}</span>
        </p>
        {order.mock && <p className="notice notice--plain"><span>Sample order. It was created in development mode and is not a real purchase.</span></p>}

        <div className="confirm__grid">
          <div>
            <h2>Items</h2>
            <OrderItems items={order.items} />
            <OrderTotalsStatic order={order} />
          </div>
          <div>
            <h2>Delivering to</h2>
            <Address shipping={order.shipping} />
            <h2 style={{ marginTop: 28 }}>What happens next</h2>
            <ManualProcessNote compact />
          </div>
        </div>

        <div className="btn-row">
          <Button as={Link} to={`/my-orders/${order.id}`}>Track this order</Button>
          <Button as={Link} to="/shop" variant="secondary">Keep browsing</Button>
        </div>
      </div>
    </div>
  );
}
