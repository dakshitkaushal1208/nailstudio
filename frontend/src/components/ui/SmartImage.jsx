import { useState } from 'react';

// <img> that degrades to a quiet tinted block (with the alt text) if the
// source is missing or fails, so a broken URL never leaves a hole in a layout.
export function SmartImage({ src, alt = '', className = '', ratio, ...rest }) {
  const [failed, setFailed] = useState(false);
  const style = ratio ? { aspectRatio: ratio } : undefined;

  if (!src || failed) {
    return (
      <div className={`img-fallback ${className}`} style={style} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
        <span>{alt || 'Image unavailable'}</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} style={style} loading="lazy" decoding="async" onError={() => setFailed(true)} {...rest} />;
}
