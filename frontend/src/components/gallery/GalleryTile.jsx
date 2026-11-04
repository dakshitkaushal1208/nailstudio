import { SmartImage } from '../ui/SmartImage';

// One image in an editorial grid. Opens the lightbox via onOpen.
export function GalleryTile({ item, onOpen, className = '', caption = true, ratio }) {
  return (
    <figure className={`tile ${className}`}>
      <button type="button" className="tile__btn" onClick={onOpen} aria-label={`View ${item.title}`}>
        <SmartImage src={item.imageUrl} alt={item.title} className="tile__img" ratio={ratio} />
      </button>
      {caption && (
        <figcaption className="tile__cap">
          <span className="tile__title">{item.title}</span>
          <span className="cap tile__cat">{item.category}</span>
        </figcaption>
      )}
    </figure>
  );
}
