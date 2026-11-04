import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Loading, ErrorState, EmptyState, SampleNote } from '../components/ui/States';
import { GalleryTile } from '../components/gallery/GalleryTile';
import { Lightbox } from '../components/gallery/Lightbox';
import { useAsync } from '../hooks/useAsync';
import { usePageMeta } from '../hooks/usePageMeta';
import { galleryService } from '../services/galleryService';
import { plural } from '../utils/format';

export default function GalleryPage() {
  usePageMeta('Gallery');
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const [open, setOpen] = useState(-1);

  const { data: items, loading, error, retry } = useAsync(() => galleryService.list(), []);
  const { data: categories } = useAsync(() => galleryService.categories(), []);

  const shown = useMemo(() => (items || []).filter((g) => !category || g.category === category), [items, category]);

  const choose = (c) => {
    const next = new URLSearchParams(params);
    if (c) next.set('category', c);
    else next.delete('category');
    setParams(next, { replace: true });
  };

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">The gallery</p>
        <h1 className="h-page">
          Finishes, shapes <em>&amp; small details.</em>
        </h1>
        <p className="lede">A look at the nail art we love to make. Choose a style to narrow the view, and open any image for a closer look.</p>
        <SampleNote />
      </header>

      <div className="filter-bar">
        <div className="tabs" role="group" aria-label="Filter by style">
          <button type="button" className="tab" aria-pressed={!category} onClick={() => choose('')}>
            All
          </button>
          {(categories || []).map((c) => (
            <button key={c} type="button" className="tab" aria-pressed={category === c} onClick={() => choose(c)}>
              {c}
            </button>
          ))}
        </div>
        {!loading && !error && (
          <p className="filter-bar__count" aria-live="polite">
            {plural(shown.length, 'design')}
            {category && ` in ${category}`}
          </p>
        )}
      </div>

      {loading && <Loading block label="Loading the gallery" />}
      {error && <ErrorState error={error} onRetry={retry} />}
      {!loading && !error && shown.length === 0 && (
        <EmptyState
          title={category ? `No ${category} designs yet` : 'The gallery is empty'}
          action={
            category && (
              <Button variant="secondary" onClick={() => choose('')}>
                Show all designs
              </Button>
            )
          }
        >
          {category ? 'We have not added any designs in this style. Try another one.' : 'New work will appear here soon.'}
        </EmptyState>
      )}

      {shown.length > 0 && (
        <div className="gallery-cols" style={{ paddingBottom: 'clamp(56px, 7vw, 100px)' }}>
          {shown.map((item, i) => (
            <GalleryTile key={item.id} item={item} onOpen={() => setOpen(i)} ratio={['4 / 5', '1 / 1', '3 / 4', '4 / 5'][i % 4]} />
          ))}
        </div>
      )}

      {open >= 0 && <Lightbox items={shown} index={open} onClose={() => setOpen(-1)} onIndex={setOpen} />}
    </div>
  );
}
