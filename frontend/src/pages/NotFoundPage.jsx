import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { usePageMeta } from '../hooks/usePageMeta';

export default function NotFoundPage() {
  usePageMeta('Page not found');
  return (
    <div className="container notfound">
      <svg className="notfound__mark" viewBox="0 0 120 160" aria-hidden>
        <path d="M60 6c27 21 45 52 45 90 0 33-18 56-45 56S15 129 15 96C15 58 33 27 60 6z" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M60 6c27 21 45 52 45 90" fill="none" stroke="var(--gold-500)" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <p className="eyebrow eyebrow--plain">Error 404</p>
      <h1 className="h-page">
        This page <em>slipped away.</em>
      </h1>
      <p className="lede">The link may be mistyped or the page may have moved. Let us get you back to something beautiful.</p>
      <div className="btn-row" style={{ justifyContent: 'center' }}>
        <Button as={Link} to="/">Back to the studio</Button>
        <Button as={Link} to="/shop" variant="secondary">Shop press-on nails</Button>
      </div>
    </div>
  );
}
