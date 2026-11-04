import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SmartImage } from '../ui/SmartImage';
import { Button } from '../ui/Button';
import { QuickAdd } from './QuickAdd';
import { productStock } from '../../services/productService';
import { formatPrice } from '../../utils/format';

export function availability(product) {
  const stock = productStock(product);
  if (stock < 1) return { label: 'Sold out', tone: 'out' };
  if (stock <= 5) return { label: 'Few left', tone: 'low' };
  return { label: 'Available', tone: 'in' };
}

export function ProductCard({ product }) {
  const [quick, setQuick] = useState(false);
  const status = availability(product);
  const soldOut = status.tone === 'out';
  const [first, second] = product.images;

  return (
    <article className="pcard">
      <Link to={`/shop/${product.slug}`} className="pcard__media" aria-label={`${product.name}, view details`}>
        <SmartImage src={first} alt="" className="pcard__img pcard__img--a" />
        {second && <SmartImage src={second} alt="" className="pcard__img pcard__img--b" />}
        {soldOut && <span className="pcard__flag">Sold out</span>}
      </Link>
      <div className="pcard__meta">
        <div>
          <h3 className="pcard__name">
            <Link to={`/shop/${product.slug}`}>{product.name}</Link>
          </h3>
          <p className="pcard__cat">{product.category}</p>
        </div>
        <p className="pcard__price num">{formatPrice(product.price)}</p>
      </div>
      <p className={`pcard__avail pcard__avail--${status.tone}`}>{status.label}</p>
      <div className="pcard__actions">
        <Link to={`/shop/${product.slug}`} className="btn btn--link">
          View details
        </Link>
        <Button variant="secondary" size="sm" onClick={() => setQuick(true)} disabled={soldOut}>
          Add to cart
        </Button>
      </div>
      {quick && <QuickAdd product={product} onClose={() => setQuick(false)} />}
    </article>
  );
}
