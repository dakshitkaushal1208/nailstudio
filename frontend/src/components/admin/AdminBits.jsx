import { Link } from 'react-router-dom';

// Headline number on the dashboard overview.
export function Stat({ label, value, hint, to, alert }) {
  const body = (
    <>
      <span className="stat__label">{label}</span>
      <span className={`stat__value num ${alert ? 'is-alert' : ''}`}>{value}</span>
      {hint && <span className="stat__hint">{hint}</span>}
    </>
  );
  return to ? (
    <Link to={to} className="stat stat--link">
      {body}
    </Link>
  ) : (
    <div className="stat">{body}</div>
  );
}

export function Section({ title, action, children, className = '' }) {
  return (
    <section className={`asec ${className}`}>
      <div className="asec__head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Toolbar({ children }) {
  return <div className="toolbar">{children}</div>;
}

// Accessible on/off switch (a real checkbox underneath).
export function Switch({ checked, onChange, label, disabled }) {
  return (
    <label className={`switch ${disabled ? 'is-disabled' : ''}`}>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
      <span className="switch__track" aria-hidden />
      <span className="switch__label">{label}</span>
    </label>
  );
}

export function Thumb({ src, alt = '' }) {
  if (!src) return <span className="thumb thumb--empty" aria-hidden />;
  return <img className="thumb" src={src} alt={alt} loading="lazy" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />;
}
