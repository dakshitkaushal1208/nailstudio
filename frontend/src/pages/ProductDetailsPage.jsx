import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Quantity } from '../components/ui/Quantity';
import { SmartImage } from '../components/ui/SmartImage';
import { Loading, ErrorState, EmptyState, SampleNote } from '../components/ui/States';
import { VariantPicker, initialSelection } from '../components/products/VariantPicker';
import { ProductCard } from '../components/products/ProductCard';
import { useAsync } from '../hooks/useAsync';
import { usePageMeta } from '../hooks/usePageMeta';
import { useCart, snapshotLine } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useStudio } from '../context/StudioContext';
import { productService, findVariant } from '../services/productService';
import { formatPrice } from '../utils/format';

export const BUY_NOW_KEY = 'nailstudio.buynow';

function Related({ current }) {
  const { data } = useAsync(() => productService.list({ sort: 'newest' }), []);
  const items = (data || []).filter((p) => p.id !== current.id).slice(0, 3);
  if (!items.length) return null;
  return (
    <section className="section section--sand">
      <div className="container">
        <h2 className="h-section" style={{ marginBottom: 40 }}>
          You may also <em>like.</em>
        </h2>
        <div className="pgrid pgrid--3">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { settings } = useStudio();
  const toast = useToast();

  const { data: product, loading, error, retry } = useAsync(() => productService.getBySlug(slug), [slug]);
  usePageMeta(product?.name || 'Press-on nails');

  const [selection, setSelection] = useState({});
  const [qty, setQty] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    if (product) {
      setSelection(initialSelection(product));
      setQty(1);
      setImageIndex(0);
    }
  }, [product]);

  const variant = product ? findVariant(product, selection) : null;
  const available = !!variant && variant.stock > 0;
  useEffect(() => setQty(1), [variant?.id]);

  if (loading) return <Loading block label="Loading" />;
  if (error) return <div className="container"><ErrorState error={error} onRetry={retry} /></div>;
  if (!product) {
    return (
      <div className="container section">
        <EmptyState
          title="We could not find that set"
          action={
            <Button as={Link} to="/shop" variant="secondary">
              Back to the shop
            </Button>
          }
        >
          It may have been retired, or the link may be mistyped.
        </EmptyState>
      </div>
    );
  }

  const addToCart = () => {
    const res = add(product, variant, qty);
    toast(res.message, { tone: res.ok ? 'ok' : 'bad' });
  };

  const buyNow = () => {
    try {
      sessionStorage.setItem(BUY_NOW_KEY, JSON.stringify(snapshotLine(product, variant, qty)));
    } catch {
      toast('Buy now needs session storage. Use Add to cart instead.', { tone: 'bad' });
      return;
    }
    navigate('/checkout?mode=buynow');
  };

  return (
    <>
      <div className="container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/shop">Shop</Link>
          <span aria-hidden>/</span>
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
          <span aria-hidden>/</span>
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className="pdp">
          <div className="pdp__gallery">
            {product.images.length > 1 && (
              <div className="pdp__thumbs">
                {product.images.map((src, i) => (
                  <button key={src + i} type="button" className="pdp__thumb" aria-current={i === imageIndex} aria-label={`Show image ${i + 1}`} onClick={() => setImageIndex(i)}>
                    <SmartImage src={src} alt="" className="fit" />
                  </button>
                ))}
              </div>
            )}
            <div className="pdp__main">
              <SmartImage src={product.images[imageIndex]} alt={`${product.name} press-on nails`} className="fit" />
            </div>
          </div>

          <div className="pdp__info">
            <p className="cap pdp__cat">{product.category}</p>
            <h1 className="pdp__name">{product.name}</h1>
            <p className="pdp__price num">{formatPrice(product.price)}</p>
            <p className="pdp__desc">{product.description}</p>

            <VariantPicker product={product} selection={selection} onChange={setSelection} />

            <div className="field" style={{ marginTop: 26 }}>
              <span className="field__label">Quantity</span>
              <Quantity value={qty} onChange={setQty} max={available ? variant.stock : 1} disabled={!available} />
            </div>

            <div className="pdp__buy">
              <Button onClick={addToCart} disabled={!available} size="lg">
                Add to cart
              </Button>
              <Button variant="secondary" onClick={buyNow} disabled={!available} size="lg">
                Buy now
              </Button>
            </div>
            <p className="pdp__note">Orders are confirmed by the studio. Payment and delivery are arranged with you directly; nothing is charged online.</p>

            <div className="pdp__details">
              {product.details?.length > 0 && (
                <>
                  <h2>About this set</h2>
                  <ul>
                    {product.details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </>
              )}
              {settings?.deliveryPolicy?.text && (
                <>
                  <h2>Delivery</h2>
                  <p className="pdp__note">{settings.deliveryPolicy.text}</p>
                </>
              )}
            </div>
            <SampleNote>Sample product, price and imagery for development.</SampleNote>
          </div>
        </div>
      </div>
      <Related current={product} />
    </>
  );
}
