import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, ShoppingBag, X } from 'lucide-react';
import { Logo } from '../ui/Brand';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { USE_MOCK } from '../../config';

const PUBLIC_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/book', label: 'Book Appointment' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/shop', label: 'Shop' },
];

const MEMBER_LINKS = [
  { to: '/my-orders', label: 'My Orders' },
  { to: '/my-bookings', label: 'My Bookings' },
];

function AccountMenu() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => !box.current?.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const first = user.name.split(' ')[0];
  const signOut = async () => {
    setOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <div className="acct" ref={box}>
      <button type="button" className="acct__btn" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)}>
        <span className="acct__avatar" aria-hidden>
          {first[0]?.toUpperCase()}
        </span>
        <span className="acct__name">{first}</span>
        <ChevronDown size={15} aria-hidden />
      </button>
      {open && (
        <div className="acct__menu" role="menu">
          <Link role="menuitem" to="/account" onClick={() => setOpen(false)}>
            Account
          </Link>
          <Link role="menuitem" to="/my-orders" onClick={() => setOpen(false)}>
            My orders
          </Link>
          <Link role="menuitem" to="/my-bookings" onClick={() => setOpen(false)}>
            My bookings
          </Link>
          {isAdmin && (
            <Link role="menuitem" to="/admin" onClick={() => setOpen(false)}>
              Studio dashboard
            </Link>
          )}
          <button role="menuitem" type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { user, ready, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setMenu(false), [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menu]);

  const links = user ? [...PUBLIC_LINKS, ...MEMBER_LINKS] : PUBLIC_LINKS;

  return (
    <>
      {USE_MOCK && (
        <div className="devstrip">Development mode · sample content · nothing here is saved to a server</div>
      )}
      <header className="header">
        <div className="header__inner">
          <Logo />
          <nav className="nav" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className="nav__link">
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="header__tools">
            {ready && !user && (
              <div className="header__auth">
                <Link to="/login">Log in</Link>
                <span aria-hidden>/</span>
                <Link to="/register">Register</Link>
              </div>
            )}
            {ready && user && <AccountMenu />}
            <Link to="/cart" className="cart-link" aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}>
              <ShoppingBag size={21} strokeWidth={1.5} aria-hidden />
              {count > 0 && <span className="cart-link__count">{count}</span>}
            </Link>
            <button type="button" className="menu-btn" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="mobile-menu" aria-label={menu ? 'Close menu' : 'Open menu'}>
              {menu ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-menu" className={`mobile-menu ${menu ? 'is-open' : ''}`} hidden={!menu}>
        <nav aria-label="Mobile">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="mobile-menu__link">
              {l.label}
            </NavLink>
          ))}
          {user && (
            <NavLink to="/account" className="mobile-menu__link">
              Account
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className="mobile-menu__link">
              Studio dashboard
            </NavLink>
          )}
        </nav>
        <div className="mobile-menu__foot">
          {user ? (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
            >
              Sign out
            </button>
          ) : (
            <>
              <Link className="btn btn--primary" to="/login">
                Log in
              </Link>
              <Link className="btn btn--secondary" to="/register">
                Create an account
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
