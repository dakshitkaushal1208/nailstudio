import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState, ErrorState, Loading } from '../components/ui/States';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SmartImage } from '../components/ui/SmartImage';
import { useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { usePageMeta } from '../hooks/usePageMeta';
import { orderService } from '../services/orderService';
import { formatStamp } from '../utils/date';
import { formatPrice, plural } from '../utils/format';

export default function MyOrdersPage() {
  usePageMeta('My orders');
  const { user } = useAuth();
  const { data: orders, loading, error, retry } = useAsync(() => orderService.listMine({ userId: user.id }), []);

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">Your account</p>
        <h1 className="h-page">
          My <em>orders.</em>
        </h1>
      </header>

      {loading && <Loading block label="Loading your orders" />}
      {error && <ErrorState error={error} onRetry={retry} />}
      {orders && orders.length === 0 && (
        <EmptyState title="No orders yet" action={<Button as={Link} to="/shop">Browse press-on nails</Button>}>
          Orders you place will appear here with their confirmation, payment and delivery status.
        </EmptyState>
      )}
      {orders && orders.length > 0 && (
        <ul className="rows">
          {orders.map((o) => (
            <li key={o.id}>
              <Link to={`/my-orders/${o.id}`} className="row">
                <div className="row__thumbs" aria-hidden>
                  {o.items.slice(0, 3).map((it) => (
                    <SmartImage key={it.variantId} src={it.image} alt="" />
                  ))}
                </div>
                <div className="row__main">
                  <p className="row__title">
                    {o.number}
                    {o.mock && <span className="row__sample">sample</span>}
                  </p>
                  <p className="row__sub">
                    {formatStamp(o.createdAt)} · {plural(o.items.reduce((n, i) => n + i.qty, 0), 'item')} · {formatPrice(o.total)}
                  </p>
                  {o.tracking?.number && <p className="row__sub">Tracking: {o.tracking.carrier} {o.tracking.number}</p>}
                </div>
                <div className="row__status">
                  <StatusBadge kind="order" status={o.status} />
                  <StatusBadge kind="payment" status={o.paymentStatus} />
                </div>
                <ChevronRight size={20} strokeWidth={1.4} aria-hidden className="row__go" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
