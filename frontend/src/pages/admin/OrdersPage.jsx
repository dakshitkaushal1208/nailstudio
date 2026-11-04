import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminPage } from '../../components/layout/AdminLayout';
import { Toolbar } from '../../components/admin/AdminBits';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { EmptyState, ErrorState, Loading } from '../../components/ui/States';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAsync } from '../../hooks/useAsync';
import { usePageMeta } from '../../hooks/usePageMeta';
import { adminService } from '../../services/adminService';
import { formatStamp } from '../../utils/date';
import { formatPrice } from '../../utils/format';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../utils/status';

const opts = (map) => Object.entries(map).map(([value, v]) => ({ value, label: v.label }));

export default function OrdersPage() {
  usePageMeta('Orders');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const { data, loading, error, retry } = useAsync(() => adminService.listOrders({ search, status, paymentStatus }), [search, status, paymentStatus]);
  const filtered = search || status || paymentStatus;

  return (
    <AdminPage title="Orders" intro="Confirm orders, arrange payment by hand, and follow each one to delivery.">
      <Toolbar>
        <Input label="Search" placeholder="Order number, name or email" value={search} onChange={(e) => setSearch(e.target.value)} wrapperClass="toolbar__field toolbar__field--wide" />
        <Select label="Order status" value={status} onChange={(e) => setStatus(e.target.value)} options={opts(ORDER_STATUS)} placeholder="All" wrapperClass="toolbar__field" />
        <Select label="Payment" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} options={opts(PAYMENT_STATUS)} placeholder="All" wrapperClass="toolbar__field" />
        {filtered && (
          <Button variant="ghost" onClick={() => { setSearch(''); setStatus(''); setPaymentStatus(''); }}>
            Clear filters
          </Button>
        )}
      </Toolbar>

      {loading && !data && <Loading block label="Loading orders" />}
      {error && <ErrorState error={error} onRetry={retry} />}
      {data && data.length === 0 && <EmptyState title="No orders found">{filtered ? 'Try clearing the filters.' : 'Orders will appear here when customers place them.'}</EmptyState>}
      {data && data.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Placed</th>
                <th className="t-right">Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.map((o) => (
                <tr key={o.id}>
                  <td className="t-strong">{o.number}</td>
                  <td>
                    {o.customer.name}
                    <br />
                    <span className="muted">{o.shipping.city}</span>
                  </td>
                  <td>{formatStamp(o.createdAt)}</td>
                  <td className="t-right num">{formatPrice(o.total)}</td>
                  <td><StatusBadge kind="order" status={o.status} /></td>
                  <td><StatusBadge kind="payment" status={o.paymentStatus} /></td>
                  <td className="t-right">
                    <Button as={Link} to={`/admin/orders/${o.id}`} size="sm" variant={o.status === 'PLACED' ? 'primary' : 'secondary'}>
                      {o.status === 'PLACED' ? 'Review' : 'Open'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPage>
  );
}
