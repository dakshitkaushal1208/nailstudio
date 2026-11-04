import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function SiteLayout() {
  const { pathname, hash } = useLocation();

  // New page → start at the top (unless linking to an anchor).
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0 });
  }, [pathname, hash]);

  return (
    <div className="site">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
