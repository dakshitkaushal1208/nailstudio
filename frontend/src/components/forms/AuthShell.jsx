import { SmartImage } from '../ui/SmartImage';
import { Rule } from '../ui/Brand';
import { assets } from '../../data/assets';

// Shared frame for login / register: editorial image on one side, form on the other.
export function AuthShell({ eyebrow, title, intro, children, footer }) {
  return (
    <div className="auth">
      <div className="auth__art" aria-hidden>
        <div className="auth__arch">
          <SmartImage src={assets.heroSecondary} alt="" className="fit" />
        </div>
        <p className="auth__quote">
          Nail art by appointment,
          <br />
          <em>and press-on sets to keep.</em>
        </p>
      </div>
      <div className="auth__panel">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="h-page">{title}</h1>
        {intro && <p className="lede">{intro}</p>}
        <Rule className="auth__rule" />
        {children}
        {footer && <p className="auth__foot">{footer}</p>}
      </div>
    </div>
  );
}
