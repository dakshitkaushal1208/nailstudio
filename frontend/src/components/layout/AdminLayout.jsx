import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CalendarCheck, Clock, Images, LayoutDashboard, LogOut, Menu, Package, Settings, Sparkles, Store, X, ShoppingBag } from 'lucide-react';
import { NailMark } from '../ui/Brand';
import { useAuth } from '../../context/AuthContext';
import { useStudio } from '../../context/StudioContext';
import { USE_MOCK } from '../../config';

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/appointments', label: 'Appointments', icon: CalendarCheck },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/gallery', label: 'Gallery', icon: Images },
  { to: '/admin/services', label: 'Services', icon: Sparkles },
  { to: '/admin/availability', label: 'Availability', icon: Clock },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { settings } = useStudio();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="admin">
      <a href="#admin-main" className="skip-link">
        Skip to content
      </a>
      <header className="admin__bar">
        <button type="button" className="menu-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="admin-nav" aria-label={open ? 'Close navigation' : 'Open navigation'}>
          {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>
        <span className="admin__bar-title">{settings?.studioName || 'Nail Studio'} · Dashboard</span>
      </header>

      <aside id="admin-nav" className={`admin__side ${open ? 'is-open' : ''}`}>
        <Link to="/admin" className="admin__brand">
          <NailMark size={22} />
          <span>
            <strong>{settings?.studioName || 'Nail Studio'}</strong>
            <small>Studio dashboard</small>
          </span>
        </Link>
        <nav aria-label="Dashboard">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="admin__link">
              <Icon size={18} strokeWidth={1.5} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="admin__side-foot">
          <Link to="/" className="admin__link">
            <Store size={18} strokeWidth={1.5} aria-hidden />
            View the website
          </Link>
          <button
            type="button"
            className="admin__link"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
          >
            <LogOut size={18} strokeWidth={1.5} aria-hidden />
            Sign out
          </button>
          <p className="admin__who">{user?.email}</p>
        </div>
      </aside>

      <main id="admin-main" className="admin__main" tabIndex={-1}>
        {USE_MOCK && (
          <p className="admin__devnote">
            Development data. Changes you make here stay in this browser only; they are not saved to a real database until the API is connected.
          </p>
        )}
        <Outlet />
      </main>
    </div>
  );
}

export function AdminPage({ title, intro, actions, children, back }) {
  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <div>
          {back}
          <h1>{title}</h1>
          {intro && <p>{intro}</p>}
        </div>
        {actions && <div className="admin-page__actions">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
