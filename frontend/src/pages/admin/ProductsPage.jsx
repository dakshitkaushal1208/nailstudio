import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Pencil, Plus, Search } from 'lucide-react';
import { AdminPage } from '../../components/layout/AdminLayout';
import { Thumb, Toolbar } from '../../components/admin/AdminBits';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { Confirm } from '../../components/ui/Confirm';
import { EmptyState, ErrorState, Loading } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { usePageMeta } from '../../hooks/usePageMeta';
import { adminService } from '../../services/adminService';
import { productStock } from '../../services/productService';
import { formatPrice } from '../../utils/format';

export default function ProductsPage() {
  usePageMeta('Products');
  const toast = useToast();
  const { data, loading, error, retry, reload } = useAsync(() => adminService.listProducts(), []);
  const [q, setQ] = useState('');
  const [toggling, setToggling] = useState(null);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (data || []).filter((p) => !t || `${p.name} ${p.category}`.toLowerCase().includes(t));
  }, [data, q]);

  const setActive = async (p, active) => {
    try {
      await adminService.setProductActive({ id: p.id, active });
      toast(active ? `${p.name} is back in the shop.` : `${p.name} is hidden from the shop.`);
      reload();
    } catch (err) {
      toast(err.message, { tone: 'bad' });
      throw err;
    }
  };

  return (
    <AdminPage
      title="Press-on products"
      intro="Sets, prices, options and stock for each variant."
      actions={
        <Button as={Link} to="/admin/products/new">
          <Plus size={16} aria-hidden /> Add product
        </Button>
      }
    >
      <Toolbar>
        <Input label="Search" placeholder="Name or category" value={q} onChange={(e) => setQ(e.target.value)} wrapperClass="toolbar__field toolbar__field--wide" />
      </Toolbar>

      {loading && <Loading block label="Loading products" />}
      {error && <ErrorState error={error} onRetry={retry} />}
      {data && shown.length === 0 && <EmptyState title="No products found">{q ? 'Try a different search.' : 'Add your first press-on set.'}</EmptyState>}
      {shown.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th className="t-right">Price</th>
                <th className="t-right">In stock</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => {
                const stock = productStock(p);
                const low = p.variants.filter((v) => v.active && v.stock <= 2).length;
                return (
                  <tr key={p.id} className={p.active ? '' : 'is-off'}>
                    <td>
                      <div className="cellprod">
                        <Thumb src={p.images[0]} />
                        <div>
                          <strong>{p.name}</strong>
                          <span className="muted">{p.variants.length} variants</span>
                        </div>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td className="t-right num">{formatPrice(p.price)}</td>
                    <td className="t-right num">
                      {stock}
                      {low > 0 && <span className="pill pill--warn" style={{ marginLeft: 8 }}>{low} low</span>}
                    </td>
                    <td>{p.active ? <span className="badge badge--ok">Active</span> : <span className="badge badge--muted">Hidden</span>}</td>
                    <td>
                      <div className="table-actions">
                        <Button as={Link} to={`/admin/products/${p.id}/edit`} size="sm" variant="secondary">
                          <Pencil size={14} aria-hidden /> Edit
                        </Button>
                        {p.active && (
                          <Button as={Link} to={`/shop/${p.slug}`} size="sm" variant="ghost" aria-label={`View ${p.name} in the shop`}>
                            <ExternalLink size={14} aria-hidden />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => (p.active ? setToggling(p) : setActive(p, true))}>
                          {p.active ? 'Hide' : 'Show'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Confirm
        open={!!toggling}
        title="Hide this product?"
        message={toggling ? `${toggling.name} will no longer appear in the shop. Items already in customers’ carts become unavailable. You can show it again at any time.` : ''}
        confirmLabel="Hide product"
        onConfirm={() => setActive(toggling, false)}
        onClose={() => setToggling(null)}
      />
    </AdminPage>
  );
}
