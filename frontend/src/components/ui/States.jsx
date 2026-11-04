import { LoaderCircle, TriangleAlert } from 'lucide-react';
import { Button } from './Button';
import { USE_MOCK } from '../../config';

export function Loading({ label = 'Loading', block = false }) {
  return (
    <div className={`loading ${block ? 'loading--block' : ''}`} role="status">
      <LoaderCircle className="spin" size={20} aria-hidden />
      <span>{label}…</span>
    </div>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="empty">
      <svg className="empty__mark" viewBox="0 0 40 56" aria-hidden>
        <path d="M20 3c9 7 15 18 15 31 0 11-6 19-15 19S5 45 5 34C5 21 11 10 20 3z" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M20 12c5 6 8 14 8 22" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".6" />
      </svg>
      <h3 className="empty__title">{title}</h3>
      {children && <p className="empty__text">{children}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry, title = 'That did not load' }) {
  return (
    <div className="empty empty--error" role="alert">
      <TriangleAlert size={28} strokeWidth={1.4} aria-hidden />
      <h3 className="empty__title">{title}</h3>
      <p className="empty__text">{error?.message || 'Something went wrong. Please try again.'}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

// Visible only in development mode, so sample content is never mistaken for the real studio's.
export function SampleNote({ children = 'Sample artwork and details for development. Replace with the studio’s own photography and information.' }) {
  if (!USE_MOCK) return null;
  return <p className="sample-note">{children}</p>;
}
