import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Quantity } from '../components/ui/Quantity';
import { SmartImage } from '../components/ui/SmartImage';
import { EmptyState } from '../components/ui/States';
import { useCart } from '../context/CartContext';
import { useStudio } from '../context/StudioContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { deliveryFor } from '../services/orderService';
import { formatPrice, variantLabel, plural } from '../utils/format';

export function OrderTotals({ subtotal, settings }) {
  const delivery = deliveryFor(subtotal, settings?.deliveryPolicy);
  return (
    <>
      <div className="summary__row">
        <span>Subtotal</span>
        <span className="num">{formatPrice(subtotal)}</span>
      </div>
      <div className="summary__row">
        <span>
          Delivery
          {delivery === null && <small>Confirmed by the studio</small>}
        </span>
        <span className="num">{delivery === null ? 'To be confirmed' : delivery === 0 ? 'Free' : formatPrice(delivery)}</span>
      </div>
      <div className="summary__row summary__row--total">
        <span>{delivery === null ? 'Total so far' : 'Total'}</span>
        <span className="num">{formatPrice(subtotal + (delivery || 0))}</span>
      </div>
    </>
  );
}

export default function CartPage() {
  usePageMeta('Your cart');
  const { lines, purchasable, subtotal, count, setQty, remove, refresh } = useCart();
  const { settings } = useStudio();
  const navigate = useNavigate();

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (lines.length === 0) {
    return (
      <div className="container section">
        <EmptyState
          title="Your cart is empty"
          action={
            <Button as={Link} to="/shop">
              Browse press-on nails
            </Button>
          }
        >
          Sets you add will wait for you here.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">Your cart</p>
        <h1 className="h-page">
          {plural(count, 'item')} <em>so far.</em>
        </h1>
      </header>

      <div className="cart-layout">
        <div className="cart-lines">
          {lines.map((l) => (
            <article key={l.key} className={`cline ${l.unavailable ? 'cline--off' : ''}`}>
              <Link to={`/shop/${l.slug}`}>
                <SmartImage src={l.image} alt="" className="cline__img" />
              </Link>
              <div>
                <h2>
                  <Link to={`/shop/${l.slug}`}>{l.name}</Link>
                </h2>
                <p className="cline__opts">{variantLabel(l.options)}</p>
                <div className="cline__row">
                  <Quantity value={l.qty} max={Math.max(l.stock, 1)} disabled={l.unavailable} onChange={(n) => setQty(l.key, n)} label={`Quantity for ${l.name}`} />
                  <Button variant="ghost" size="sm" onClick={() => remove(l.key)} aria-label={`Remove ${l.name} from cart`}>
                    <Trash2 size={16} aria-hidden /> Remove
                  </Button>
                </div>
                {l.unavailable && <p className="cline__flag">This option is no longer available. Remove it to continue.</p>}
                {!l.unavailable && l.qty >= l.stock && <p className="cline__flag" style={{ color: 'var(--gold-700)' }}>That is all we have in stock.</p>}
              </div>
              <p className="cline__price num">
                {formatPrice(l.price * l.qty)}
                {l.qty > 1 && <span className="cline__unit">{formatPrice(l.price)} each</span>}
              </p>
            </article>
          ))}
        </div>

        <aside className="summary" aria-labelledby="sum-h">
          <h2 id="sum-h">Summary</h2>
          <OrderTotals subtotal={subtotal} settings={settings} />
          <p className="summary__note">The studio confirms every order by hand, then arranges payment and delivery with you. Nothing is charged online.</p>
          <Button size="lg" onClick={() => navigate('/checkout')} disabled={purchasable.length === 0 || purchasable.length < lines.length}>
            Continue to checkout
          </Button>
          {purchasable.length < lines.length && <p className="field__error" style={{ marginTop: 10 }}>Remove the unavailable item to continue.</p>}
          <p style={{ textAlign: 'center', margin: '18px 0 0' }}>
            <Link to="/shop" className="btn btn--link">
              Keep shopping
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
