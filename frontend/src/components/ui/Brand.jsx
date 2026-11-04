
import { Link } from 'react-router-dom';
import { useStudio } from '../../context/StudioContext';

// Keep this export so existing imports don't break.
// It is not displayed in the wordmark.
export function NailMark({ size = 30 }) {
  return (
    <svg
      className="mark"
      width={size}
      height={size * 1.35}
      viewBox="0 0 40 54"
      aria-hidden="true"
    >
      <path
        d="M20 2c9 7 15 17 15 30 0 11-6 19-15 19S5 43 5 32C5 19 11 9 20 2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M20 2c9 7 15 17 15 30"
        fill="none"
        stroke="var(--gold-500)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ light = false }) {
  const { settings } = useStudio();

  const name = settings?.studioName || 'Cute Icles';

  return (
    <Link
      to="/"
      className={`logo logo--wordmark ${light ? 'logo--light' : ''}`}
      aria-label="Cute Icles by Mehak Dhiman, home"
    >
      <span className="logo__text">
        <span className="logo__name">{name}</span>
        <span className="logo__sub">BY MEHAK DHIMAN</span>
      </span>
    </Link>
  );
}

export function Rule({ className = '' }) {
  return (
    <div className={`rule ${className}`} aria-hidden="true">
      <span />
      <i />
      <span />
    </div>
  );
}
