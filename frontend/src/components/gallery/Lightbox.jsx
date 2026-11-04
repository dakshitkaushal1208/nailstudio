import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { SmartImage } from '../ui/SmartImage';
import { USE_MOCK } from '../../config';

export function Lightbox({ items, index, onClose, onIndex }) {
  const item = items[index];
  const prev = () => onIndex((index - 1 + items.length) % items.length);
  const next = () => onIndex((index + 1) % items.length);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, items.length]);

  if (!item) return null;
  return (
    <Modal open onClose={onClose} title="" variant="lightbox" size="lg" labelledBy="lightbox-title">
      <div className="lightbox">
        <div className="lightbox__stage">
          <SmartImage src={item.imageUrl} alt={item.title} className="lightbox__img" />
          {items.length > 1 && (
            <>
              <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={prev} aria-label="Previous image">
                <ChevronLeft size={22} aria-hidden />
              </button>
              <button type="button" className="lightbox__nav lightbox__nav--next" onClick={next} aria-label="Next image">
                <ChevronRight size={22} aria-hidden />
              </button>
            </>
          )}
        </div>
        <div className="lightbox__caption">
          <p className="cap lightbox__cat">{item.category}</p>
          <h2 id="lightbox-title">{item.title}</h2>
          {item.description && <p>{item.description}</p>}
          {USE_MOCK && item.sample && <p className="sample-note">Sample illustration, not the studio’s work.</p>}
          <p className="lightbox__count num">
            {index + 1} / {items.length}
          </p>
        </div>
      </div>
    </Modal>
  );
}
