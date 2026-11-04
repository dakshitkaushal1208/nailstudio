import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Field';
import { Loading, ErrorState, EmptyState, SampleNote } from '../components/ui/States';
import { ProductCard } from '../components/products/ProductCard';
import { useAsync } from '../hooks/useAsync';
import { usePageMeta } from '../hooks/usePageMeta';
import { productService } from '../services/productService';
import { galleryService } from '../services/galleryService';
import { plural } from '../utils/format';

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];
const SHAPES = ['Almond', 'Coffin', 'Oval', 'Square'];

export default function ShopPage() {
  usePageMeta('Press-on nails');
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const shape = params.get('shape') || '';
  const sort = params.get('sort') || 'newest';
  const availableOnly = params.get('available') === '1';

  // The search box is typed into freely, then pushed to the URL after a pause.
  const [text, setText] = useState(q);
  useEffect(() => setText(q), [q]);
  useEffect(() => {
    if (text === q) return undefined;
    const t = setTimeout(() => set('q', text), 280);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const { data, loading, error, retry } = useAsync(
    () => productService.list({ search: q, category, shape, sort, availableOnly }),
    [q, category, shape, sort, availableOnly]
  );
  const { data: categories } = useAsync(() => galleryService.categories(), []);

  const filtered = !!(q || category || shape || availableOnly);

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">Press-on nails</p>
        <h1 className="h-page">
          The shop, <em>ready to wear.</em>
        </h1>
        <p className="lede">Salon-style sets in the shape and size that suit you. Orders are confirmed by the studio, which then arranges payment and delivery with you directly.</p>
        <SampleNote>Sample products, prices and stock for development.</SampleNote>
      </header>

      <form className="shop-tools" role="search" onSubmit={(e) => e.preventDefault()}>
        <Input label="Search" type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Name, style or finish" />
        <Select label="Style" value={category} onChange={(e) => set('category', e.target.value)} placeholder="All styles" options={categories?.filter((c) => c !== 'Press-on Sets') || []} />
        <Select label="Shape" value={shape} onChange={(e) => set('shape', e.target.value)} placeholder="Any shape" options={SHAPES} />
        <Select label="Sort by" value={sort} onChange={(e) => set('sort', e.target.value === 'newest' ? '' : e.target.value)} options={SORTS} />
        <label className="check">
          <input type="checkbox" checked={availableOnly} onChange={(e) => set('available', e.target.checked ? '1' : '')} />
          In stock only
        </label>
      </form>

      <div className="shop-count">
        <p aria-live="polite">{!loading && !error && plural(data?.length || 0, 'set')}</p>
        {filtered && (
          <Button variant="link" onClick={() => setParams({}, { replace: true })}>
            Clear filters
          </Button>
        )}
      </div>

      {loading && <Loading block label="Loading the collection" />}
      {error && <ErrorState error={error} onRetry={retry} />}
      {!loading && !error && data?.length === 0 && (
        <EmptyState
          title="No sets match that search"
          action={
            <Button variant="secondary" onClick={() => setParams({}, { replace: true })}>
              Clear filters
            </Button>
          }
        >
          Try a different word, or remove a filter to see the whole collection.
        </EmptyState>
      )}
      {data?.length > 0 && (
        <div className="pgrid pgrid--3" style={{ paddingBottom: 'clamp(56px, 7vw, 110px)' }}>
          {data.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
