import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CircleAlert, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Field';
import { SmartImage } from '../components/ui/SmartImage';
import { EmptyState } from '../components/ui/States';
import { ManualProcessNote } from '../components/orders/OrderParts';
import { OrderTotals } from './CartPage';
import { BUY_NOW_KEY } from './ProductDetailsPage';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStudio } from '../context/StudioContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { orderService } from '../services/orderService';
import { formatPrice, variantLabel } from '../utils/format';
import { isPhone, isPin } from '../utils/validate';
import { INDIAN_STATES } from '../utils/regions';
import { USE_MOCK } from '../config';

const readBuyNow = () => {
  try {
    return JSON.parse(sessionStorage.getItem(BUY_NOW_KEY) || 'null');
  } catch {
    return null;
  }
};

export default function CheckoutPage() {
  usePageMeta('Checkout');
  const [params] = useSearchParams();
  const buyNow = params.get('mode') === 'buynow';
  const { user } = useAuth();
  const { purchasable, lines, subtotal: cartSubtotal, clear, refresh } = useCart();
  const { settings } = useStudio();
  const navigate = useNavigate();

  const [single] = useState(() => (buyNow ? readBuyNow() : null));
  const items = useMemo(() => (buyNow ? (single ? [single] : []) : purchasable), [buyNow, single, purchasable]);
  const subtotal = buyNow ? (single ? single.price * single.qty : 0) : cartSubtotal;

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    locality: '',
    city: '',
    state: '',
    pin: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!buyNow) refresh();
  }, [buyNow, refresh]);

  const hasUnavailable = !buyNow && lines.length > purchasable.length;

  if (items.length === 0 && !busy) {
    return (
      <div className="container section">
        <EmptyState
          title="Nothing to check out"
          action={
            <Button as={Link} to="/shop">
              Browse press-on nails
            </Button>
          }
        >
          {buyNow ? 'That quick purchase has expired.' : 'Add a set to your cart first.'}
        </EmptyState>
      </div>
    );
  }

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
    setFormError('');
  };

  const validate = () => ({
    name: form.name.trim().length < 2 ? 'Enter the recipient’s name.' : '',
    phone: !isPhone(form.phone) ? 'Enter a valid 10-digit mobile number.' : '',
    street: form.street.trim().length < 3 ? 'Enter the street address.' : '',
    locality: form.locality.trim().length < 2 ? 'Enter the locality or area.' : '',
    city: form.city.trim().length < 2 ? 'Enter the city.' : '',
    state: form.state ? '' : 'Choose a state.',
    pin: !isPin(form.pin) ? 'Enter a 6-digit PIN code.' : '',
  });

  const submit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      document.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    setBusy(true);
    setFormError('');
    try {
      const order = await orderService.place({
        userId: user.id,
        items: items.map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty })),
        customer: { name: user.name, email: user.email, phone: form.phone.trim() },
        shipping: Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])),
      });
      if (buyNow) sessionStorage.removeItem(BUY_NOW_KEY);
      else clear();
      navigate(`/order-confirmation/${order.id}`, { replace: true });
    } catch (err) {
      setFormError(err.message || 'We could not send your order. Please try again.');
      setErrors((er) => ({ ...er, ...err.fieldErrors }));
      setBusy(false);
      if (err.status === 409) refresh();
    }
  };

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">Checkout</p>
        <h1 className="h-page">
          Where should we <em>send it?</em>
        </h1>
      </header>

      <div className="cart-layout">
        <form onSubmit={submit} noValidate>
          <section className="checkout-panel" aria-labelledby="ship-h">
            <h2 id="ship-h">Delivery details</h2>
            <p className="muted">We will contact you on this number to confirm your order.</p>
            <div className="form-grid">
              <Input wrapperClass="span-2" label="Recipient name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
              <Input wrapperClass="span-2" label="Phone number" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
              <Input wrapperClass="span-2" label="Street address" autoComplete="address-line1" value={form.street} onChange={set('street')} error={errors.street} hint="House or flat number, building, street." />
              <Input label="Locality" autoComplete="address-line2" value={form.locality} onChange={set('locality')} error={errors.locality} />
              <Input label="City" autoComplete="address-level2" value={form.city} onChange={set('city')} error={errors.city} />
              <Select label="State" autoComplete="address-level1" value={form.state} onChange={set('state')} error={errors.state} options={INDIAN_STATES} placeholder="Choose a state" />
              <Input label="PIN code" inputMode="numeric" autoComplete="postal-code" maxLength={6} value={form.pin} onChange={set('pin')} error={errors.pin} />
            </div>
          </section>

          <section className="checkout-panel" aria-labelledby="how-h">
            <h2 id="how-h">How ordering works</h2>
            <p className="muted">There is no online payment. {settings?.deliveryPolicy?.text}</p>
            <ManualProcessNote />
          </section>

          {USE_MOCK && (
            <p className="notice notice--plain" style={{ marginTop: 28 }}>
              <Info size={18} aria-hidden />
              <span>Development mode: this creates a sample order in your browser only. The studio will not receive it.</span>
            </p>
          )}
          {formError && (
            <div className="notice notice--bad" role="alert" style={{ marginTop: 20 }}>
              <CircleAlert size={18} aria-hidden />
              <p>{formError}</p>
            </div>
          )}
          <div className="btn-row" style={{ marginTop: 28 }}>
            <Button type="submit" size="lg" loading={busy} disabled={hasUnavailable}>
              Send order request
            </Button>
            <Button as={Link} to={buyNow ? '/shop' : '/cart'} variant="ghost">
              Back
            </Button>
          </div>
          {hasUnavailable && <p className="field__error" style={{ marginTop: 10 }}>An item in your cart is unavailable. Return to the cart to remove it.</p>}
        </form>

        <aside className="summary" aria-labelledby="osum-h">
          <h2 id="osum-h">Your order</h2>
          <ul className="summary__items">
            {items.map((l) => (
              <li key={l.key}>
                <SmartImage src={l.image} alt="" />
                <span>
                  {l.name}
                  <small style={{ display: 'block', color: 'var(--ink-soft)' }}>
                    {variantLabel(l.options)} · Qty {l.qty}
                  </small>
                </span>
                <span className="num">{formatPrice(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <OrderTotals subtotal={subtotal} settings={settings} />
          <p className="summary__note">Your order is a request until the studio confirms it. It is not marked as paid.</p>
        </aside>
      </div>
    </div>
  );
}
