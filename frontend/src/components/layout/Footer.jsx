import { Link } from 'react-router-dom';
import { Logo } from '../ui/Brand';
import { useStudio } from '../../context/StudioContext';
import { useAuth } from '../../context/AuthContext';

const Placeholder = ({ children }) => <span className="footer__todo">{children}</span>;

export function Footer() {
  const { settings } = useStudio();
  const { user } = useAuth();
  const contact = settings?.contact || {};
  const social = Object.entries(settings?.social || {}).filter(([, url]) => url);
  const name = settings?.studioName || 'Nail Studio';

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo light />
          <p>Nail art by appointment, and ready-made press-on sets delivered to your door.</p>
        </div>

        <nav aria-label="Explore" className="footer__col">
          <h2>Explore</h2>
          <Link to="/book">Book an appointment</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/shop">Press-on shop</Link>
          <Link to="/cart">Cart</Link>
          {user ? <Link to="/account">Your account</Link> : <Link to="/login">Log in</Link>}
        </nav>

        <div className="footer__col">
          <h2>Visit &amp; contact</h2>
          {contact.address ? <p>{contact.address}</p> : <Placeholder>Studio address to be added</Placeholder>}
          {contact.phone ? <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a> : <Placeholder>Phone number to be added</Placeholder>}
          {contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : <Placeholder>Email address to be added</Placeholder>}
          {contact.mapUrl && (
            <a href={contact.mapUrl} target="_blank" rel="noreferrer">
              Open in maps
            </a>
          )}
        </div>

        {social.length > 0 && (
          <div className="footer__col">
            <h2>Follow</h2>
            {social.map(([key, url]) => (
              <a key={key} href={url} target="_blank" rel="noreferrer" className="cap">
                {key}
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="container footer__base">
        <small>
          © {new Date().getFullYear()} {name}
        </small>
        <div>
          <Link to="/privacy">Privacy policy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
