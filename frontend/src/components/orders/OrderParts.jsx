import { SmartImage } from '../ui/SmartImage';
import { formatPrice, variantLabel } from '../../utils/format';
import { formatStamp } from '../../utils/date';
import { ORDER_STATUS } from '../../utils/status';

export function OrderItems({ items }) {
  return (
    <ul className="oitems">
      {items.map((it) => (
        <li key={`${it.productId}:${it.variantId}`}>
          <SmartImage src={it.image} alt="" className="oitems__img" />
          <div>
            <strong>{it.name}</strong>
            <span>{variantLabel(it.options)}</span>
            <span>
              Qty {it.qty} · {formatPrice(it.price)} each
            </span>
          </div>
          <span className="num oitems__sum">{formatPrice(it.price * it.qty)}</span>
        </li>
      ))}
    </ul>
  );
}

export function OrderTotalsStatic({ order }) {
  const pending = order.deliveryCharge === null || order.deliveryCharge === undefined;
  return (
    <div className="otot">
      <div>
        <span>Subtotal</span>
        <span className="num">{formatPrice(order.subtotal)}</span>
      </div>
      <div>
        <span>Delivery</span>
        <span className="num">{pending ? 'To be confirmed' : order.deliveryCharge === 0 ? 'Free' : formatPrice(order.deliveryCharge)}</span>
      </div>
      <div className="otot__total">
        <span>{pending ? 'Total so far' : 'Total'}</span>
        <span className="num">{formatPrice(order.total)}</span>
      </div>
    </div>
  );
}

export function Address({ shipping }) {
  if (!shipping) return null;
  return (
    <address className="address">
      <strong>{shipping.name}</strong>
      <span>{shipping.street}</span>
      <span>{shipping.locality}</span>
      <span>
        {shipping.city}, {shipping.state} {shipping.pin}
      </span>
      <span>{shipping.phone}</span>
    </address>
  );
}

export function Timeline({ history = [] }) {
  return (
    <ol className="timeline">
      {history.map((h, i) => (
        <li key={`${h.status}-${h.at}-${i}`}>
          <strong>{ORDER_STATUS[h.status]?.label || h.status}</strong>
          <time dateTime={h.at}>{formatStamp(h.at)}</time>
        </li>
      ))}
    </ol>
  );
}

export function ManualProcessNote({ compact = false }) {
  return (
    <ol className="steps">
      <li>
        <div>
          <strong>You send the order request</strong>
          {!compact && <span>Nothing is charged at this point.</span>}
        </div>
      </li>
      <li>
        <div>
          <strong>The studio reviews and confirms it</strong>
          {!compact && <span>We check stock and contact you on the phone number you give.</span>}
        </div>
      </li>
      <li>
        <div>
          <strong>Payment and delivery are arranged with you</strong>
          {!compact && <span>The studio agrees the payment method and delivery charge with you directly.</span>}
        </div>
      </li>
      <li>
        <div>
          <strong>Your set is packed and dispatched</strong>
          {!compact && <span>Status updates appear under My Orders.</span>}
        </div>
      </li>
    </ol>
  );
}
